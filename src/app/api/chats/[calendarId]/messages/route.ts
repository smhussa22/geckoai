"use server";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { authUserOrThrow } from "@/app/lib/getUser";
import { ai, model } from "@/app/lib/gemini"; // <-- new
import {
  s3, s3DeletePrefix, s3MessagesPrefix, s3WriteMessageJSON,
  s3CopyObject, s3DeleteObject, s3CommittedAttachmentKey,
  s3SignedGetUrl, s3MessageKey, s3Bucket
} from "@/app/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";

// ----- types you had -----
type StagedFile = {
  tempId: string;
  fileName: string;
  mimeType: string;
  size: number;
  s3Key: string;
};

export async function POST(req: Request, ctx: { params: Promise<{ calendarId: string }> }) {
  try {
    const user = await authUserOrThrow();
    const { calendarId } = await ctx.params;

    const { text, staged } = (await req.json()) as { text: string; staged?: StagedFile[] };
    if (!text?.trim()) return NextResponse.json({ error: "need text" }, { status: 400 });

    // ---- build history in Gemini "Content" format ----
    const previousMessages = await prisma.message.findMany({
      where: { calendarId },
      orderBy: { createdAt: "asc" },
    });

    const history: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

    for (const message of previousMessages) {
      const key = s3MessageKey(user.id, calendarId, message.id);
      let parts = [{ text: message.content }] as Array<{ text: string }>;

      try {
        const obj = await s3.send(new GetObjectCommand({ Bucket: s3Bucket, Key: key }));
        const json = JSON.parse(await obj.Body!.transformToString("utf-8"));

        if (json.attachments?.length) {
          const attachmentsText =
            "Attached files:\n" +
            json.attachments.map((a: any) => `- ${a.fileName || a.filename} [${a.mimeType}]`).join("\n");
          parts = [{ text: message.content }, { text: attachmentsText }];
        }
      } catch {
        // ignore; fallback to message only
      }

      history.push({
        role: message.role.toLowerCase() === "user" ? "user" : "model",
        parts,
      });
    }

    // ---- save the user message to DB first (like before) ----
    const userMessage = await prisma.message.create({
      data: { calendarId, role: "USER", content: text },
    });

    // move staged → committed S3 objects
    const committedFiles: { fileName: string; mimeType: string; size: number; s3Key: string }[] = [];
    for (const stagedFile of staged ?? []) {
      const key = s3CommittedAttachmentKey(user.id, calendarId, userMessage.id, stagedFile.fileName);
      await s3CopyObject(stagedFile.s3Key, key, stagedFile.mimeType);
      await s3DeleteObject(stagedFile.s3Key);
      committedFiles.push({ fileName: stagedFile.fileName, mimeType: stagedFile.mimeType, size: stagedFile.size, s3Key: key });
    }

    await s3WriteMessageJSON(user.id, calendarId, userMessage.id, {
      id: userMessage.id,
      role: "user",
      content: userMessage.content,
      calendarId,
      createdAt: userMessage.createdAt.toISOString(),
      attachments: committedFiles,
    });

    // ---- add this turn to the prompt ----
    const attachmentsForModel = await Promise.all(
      committedFiles.map(async (c) => ({
        filename: c.fileName,
        mimeType: c.mimeType,
        url: await s3SignedGetUrl(c.s3Key, 600),
      }))
    );

    const parts = [
      { text },
      ...(attachmentsForModel.length
        ? [
            {
              text:
                "Attached files (signed URLs):\n" +
                attachmentsForModel.map((a) => `- ${a.filename} [${a.mimeType}] ${a.url}`).join("\n"),
            },
          ]
        : []),
    ];

    // ---- create a chat and stream tokens ----
    const chat = ai.chats.create({
      model: model,
      history, // full prior conversation
      // optional: config: { temperature: 0.3, maxOutputTokens: 1024 }
    });

    const stream = await chat.sendMessageStream({ message: parts });

    // Use a TransformStream to stream text to the client incrementally
    const { readable, writable } = new TransformStream();
    (async () => {
      const writer = writable.getWriter();
      let fullText = "";
      try {
        for await (const chunk of stream) {
          const delta = chunk.text ?? "";
          fullText += delta;
          // you can also send JSONL if you prefer; here we write raw text
          await writer.write(new TextEncoder().encode(delta));
        }

        // Persist assistant message after stream finishes
        const assistantMessage = await prisma.message.create({
          data: { calendarId, role: "ASSISTANT", content: fullText },
        });

        await s3WriteMessageJSON(user.id, calendarId, assistantMessage.id, {
          id: assistantMessage.id,
          role: "assistant",
          content: assistantMessage.content,
          calendarId,
          createdAt: assistantMessage.createdAt.toISOString(),
          attachments: [],
        });

        await prisma.calendar.update({
          where: { id: calendarId },
          data: { lastMessageAt: new Date() },
        });
      } catch (e) {
        // optional: emit a sentinel error token
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        // Enable chunked streaming to browsers and fetch()
        "Transfer-Encoding": "chunked",
        // If you prefer SSE on the client, switch to text/event-stream and write "data: ..." lines above
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Gemini Chat Error" }, { status: 500 });
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
    return NextResponse.json({ error: error?.message ?? "Internal Server Error" }, { status: 500 });
  }
}
