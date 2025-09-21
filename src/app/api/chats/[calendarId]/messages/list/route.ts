import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { authUserOrThrow } from "@/app/lib/getUser";
import { geminiClient } from "@/app/lib/gemini";
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
} from "@/app/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";

type StagedFile = {
    tempId: string;
    fileName: string;
    mimeType: string;
    size: number;
    s3Key: string;
};

async function s3ObjectToBase64(key: string): Promise<string> {
    const obj = await s3.send(new GetObjectCommand({ Bucket: s3Bucket, Key: key }));
    const buffer = await obj.Body?.transformToByteArray();
    return Buffer.from(buffer!).toString("base64");
}

export async function GET(req: Request, ctx: { params: Promise<{ calendarId: string }> }) {
    try {
        const user = await authUserOrThrow();
        const { calendarId } = await ctx.params;

        const url = new URL(req.url);
        const all = url.searchParams.get("all") === "true";
        const takeParam = Number(url.searchParams.get("take") ?? 50);
        const take = all ? 1000 : Math.min(takeParam, 100);

        const rows = await prisma.message.findMany({
            where: { calendarId },
            orderBy: { createdAt: "asc" },
            take,
        });

        const messages = [];
        for (const message of rows) {
            const key = s3MessageKey(user.id, calendarId, message.id);
            try {
                const object = await s3.send(new GetObjectCommand({ Bucket: s3Bucket, Key: key }));
                const json = JSON.parse(await object.Body!.transformToString("utf-8"));

                const attachments = await Promise.all(
                    (json.attachments ?? []).map(async (a: any) => ({
                        id: `${message.id}:${a.fileName ?? a.filename}`,
                        name: a.fileName ?? a.filename,
                        url: await s3SignedGetUrl(a.s3Key, 900),
                        mime: a.mimeType,
                    }))
                );

                messages.push({
                    id: message.id,
                    role: message.role.toLowerCase(),
                    content: message.content,
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
    } catch (error: any) {
        console.error("GET messages error:", error);
        return NextResponse.json(
            { error: error?.message ?? "Internal Server Error" },
            { status: 500 }
        );
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

        if (!text?.trim()) return NextResponse.json({ error: "need text" }, { status: 400 });

        const userMessage = await prisma.message.create({
            data: { calendarId, role: "USER", content: text },
        });

        const committedFiles: StagedFile[] = [];
        for (const stagedFile of staged ?? []) {
            const key = s3CommittedAttachmentKey(
                user.id,
                calendarId,
                userMessage.id,
                stagedFile.fileName
            );
            await s3CopyObject(stagedFile.s3Key, key, stagedFile.mimeType);
            await s3DeleteObject(stagedFile.s3Key);

            committedFiles.push({ ...stagedFile, s3Key: key });
        }

        await s3WriteMessageJSON(user.id, calendarId, userMessage.id, {
            id: userMessage.id,
            role: "user",
            content: userMessage.content,
            calendarId,
            createdAt: userMessage.createdAt.toISOString(),
            attachments: committedFiles,
        });

        const parts: any[] = [{ text }];
        for (const f of committedFiles) {
            console.log("[messages/list/POST] Attaching inline file:", f.fileName, f.mimeType);
            const base64 = await s3ObjectToBase64(f.s3Key);
            parts.push({
                inlineData: {
                    mimeType: f.mimeType || "application/octet-stream",
                    data: base64,
                },
            });
        }
        console.log("[messages/list/POST] Final parts length:", parts.length);

        const response = await geminiClient.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts }],
        });

        const assistantText = response.text || "Failed to respond";

        const assistantMessage = await prisma.message.create({
            data: { calendarId, role: "ASSISTANT", content: assistantText },
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

        return NextResponse.json({
            message: assistantText,
            messageId: assistantMessage.id,
        });
    } catch (error: any) {
        console.error("=== GEMINI API ERROR ===", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
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
        console.error("[DELETE MESSAGES ERROR]", error);
        return NextResponse.json(
            { error: error.message || "An internal server error occurred." },
            { status: 500 }
        );
    }
}
