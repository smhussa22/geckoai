import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { authUserOrThrow } from '@/app/lib/getUser';
import { gemini } from '@/app/lib/gemini';
import {
  s3,
  s3DeletePrefix,
  s3MessagesPrefix,
  s3WriteMessageJSON,
  s3CopyObject,
  s3DeleteObject,
  s3CommittedAttachmentKey,
  s3SignedGetUrl,
  s3MessageKey,
  s3Bucket,
} from '@/app/lib/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';

type StagedFile = {
  tempId: string;
  fileName: string;
  mimeType: string;
  size: number;
  s3Key: string;
};

export const dynamic = 'force-dynamic';

export async function GET(req: Request, ctx: { params: Promise<{ calendarId: string }> }) {
  
  try {
    const user = await authUserOrThrow();
    const { calendarId } = await ctx.params;

    const url = new URL(req.url);
    const all = url.searchParams.get('all') === 'true';
    const takeParam = Number(url.searchParams.get('take') ?? 50);
    const take = all ? 1000 : Math.min(takeParam, 100);

    const rows = await prisma.message.findMany({
      where: { calendarId },
      orderBy: { createdAt: 'asc' },
      take,
    });

    const messages: any[] = [];
    for (const message of rows) {
      try {
        const key = s3MessageKey(user.id, calendarId, message.id);
        const obj = await s3.send(new GetObjectCommand({ Bucket: s3Bucket, Key: key }));
        const json = JSON.parse(await obj.Body!.transformToString('utf-8'));

        const attachments = await Promise.all(
          (json.attachments ?? []).map(async (a: any) => ({
            id: `${message.id}:${a.fileName ?? a.filename}`,
            name: a.fileName ?? a.filename,
            url: await s3SignedGetUrl(a.s3Key, 900),
            mime: a.mimeType,
          })),
        );

        messages.push({
          id: message.id,
          role: message.role.toLowerCase(),
          content: json.content ?? message.content,
          createdAt: message.createdAt.toISOString(),
          attachments,
        });
      } catch {
        messages.push({
          id: message.id,
          role: message.role.toLowerCase(),
          content: message.content,
          createdAt: message.createdAt.toISOString(),
          attachments: [],
        });
      }
    }

    return NextResponse.json({ messages });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ calendarId: string }> }) {
  try {

    const user = await authUserOrThrow();
    const { calendarId } = await ctx.params;

    const { text, staged } = (await req.json()) as {
      text: string;
      staged?: StagedFile[];
    };
    if (!text?.trim()) return NextResponse.json({ error: 'need text' }, { status: 400 });

    const previousMessages = await prisma.message.findMany({
      where: { calendarId },
      orderBy: { createdAt: 'asc' },
    });

    const history: Array<{
      role: 'user' | 'model';
      parts: Array<{ text: string }>;
    }> = [];

    for (const message of previousMessages) {
      const key = s3MessageKey(user.id, calendarId, message.id);
      let parts: Array<{ text: string }> = [{ text: message.content }];

      try {
        const obj = await s3.send(new GetObjectCommand({ Bucket: s3Bucket, Key: key }));
        const json = JSON.parse(await obj.Body!.transformToString('utf-8'));

        if (json.attachments?.length) {
          const attachmentsText =
            'Attached files:\n' +
            json.attachments
              .map((a: any) => `- ${a.fileName || a.filename} [${a.mimeType}]`)
              .join('\n');
          parts = [{ text: message.content }, { text: attachmentsText }];
        }
      } catch {}

      history.push({
        role: message.role.toLowerCase() === 'user' ? 'user' : 'model',
        parts,
      });
    }

    const userMessage = await prisma.message.create({
      data: {
        calendarId,
        role: 'USER',
        content: text,
      },
    });

    const committedFiles: {
      fileName: string;
      mimeType: string;
      size: number;
      s3Key: string;
    }[] = [];

    for (const stagedFile of staged ?? []) {
      const key = s3CommittedAttachmentKey(
        user.id,
        calendarId,
        userMessage.id,
        stagedFile.fileName,
      );
      await s3CopyObject(stagedFile.s3Key, key, stagedFile.mimeType);

      await s3DeleteObject(stagedFile.s3Key);

      committedFiles.push({
        fileName: stagedFile.fileName,
        mimeType: stagedFile.mimeType,
        size: stagedFile.size,
        s3Key: key,
      });
    }

    await s3WriteMessageJSON(user.id, calendarId, userMessage.id, {
      id: userMessage.id,
      role: 'user',
      content: userMessage.content,
      calendarId,
      createdAt: userMessage.createdAt.toISOString(),
      attachments: committedFiles,
    });

    const attachmentsForModel = await Promise.all(
      committedFiles.map(async (c) => ({
        filename: c.fileName,
        mimeType: c.mimeType,
        url: await s3SignedGetUrl(c.s3Key, 600),
      })),
    );

    const parts: Array<{ text: string }> = [{ text }];
    if (attachmentsForModel.length) {
      parts.push({
        text:
          'Attached files (signed URLs):\n' +
          attachmentsForModel.map((a) => `- ${a.filename} [${a.mimeType}] ${a.url}`).join('\n'),
      });
    }

    const chat = gemini.startChat({ history });
    const result = await chat.sendMessage(parts);
    const assistantText = result.response.text() || 'Failed to respond';

    const assistantMessage = await prisma.message.create({
      data: {
        calendarId,
        role: 'ASSISTANT',
        content: assistantText,
      },
    });

    await s3WriteMessageJSON(user.id, calendarId, assistantMessage.id, {
      id: assistantMessage.id,
      role: 'assistant',
      content: assistantMessage.content,
      calendarId,
      createdAt: assistantMessage.createdAt.toISOString(),
      attachments: [],
    });

    await prisma.calendar.update({
      where: { id: calendarId },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json({
      message: assistantText,
      messageId: assistantMessage.id,
    });
  } catch (error: any) {
    console.error('[GEMINI API ERROR]', error);

    return NextResponse.json(
      { error: error.message || 'An internal server error occurred.' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request, ctx: { params: Promise<{ calendarId: string }> }) {
  try {
    const user = await authUserOrThrow();
    const { calendarId } = await ctx.params;

    await prisma.message.deleteMany({ where: { calendarId } });
    await s3DeletePrefix(s3MessagesPrefix(user.id, calendarId));

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[GEMINI API ERROR]', error);

    return NextResponse.json(
      { error: error.message || 'An internal server error occurred.' },
      { status: 500 },
    );
  }
}
