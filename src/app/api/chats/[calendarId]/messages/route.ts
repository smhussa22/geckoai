import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { authUserOrThrow } from "@/app/lib/getUser";
import { gemini } from "@/app/lib/gemini";
import {
    s3,
    s3DeletePrefix,
    s3MessagesPrefix,
    s3WriteMessageJSON,
    s3CopyObject,
    s3DeleteObject,
    s3CommittedAttachmentKey,
    s3MessageKey,
    s3Bucket,
    s3ObjectToBase64,
} from "@/app/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

type StagedFile = {
    tempId: string;
    fileName: string;
    mimeType: string;
    size: number;
    s3Key: string;
};

export async function GET(req: Request, ctx: { params: Promise<{ calendarId: string }> }) {
    try {
        const user = await authUserOrThrow();
        const { calendarId } = await ctx.params;

        const rows = await prisma.message.findMany({
            where: { calendarId },
            orderBy: { createdAt: "asc" },
            take: 100,
        });

        const messages = [];
        for (const message of rows) {
            try {
                const key = s3MessageKey(user.id, calendarId, message.id);
                const obj = await s3.send(new GetObjectCommand({ Bucket: s3Bucket, Key: key }));
                const json = JSON.parse(await obj.Body!.transformToString("utf-8"));

                messages.push({
                    id: message.id,
                    role: message.role.toLowerCase(),
                    content: json.content ?? message.content,
                    createdAt: message.createdAt.toISOString(),
                    attachments: json.attachments ?? [],
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
        console.error("GET messages error:", e);
        return NextResponse.json({ error: e?.message ?? "Internal Server Error" }, { status: 500 });
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

        const fileParts = await Promise.all(
            committedFiles.map(async (f) => {
                const obj = await s3.send(new GetObjectCommand({ Bucket: s3Bucket, Key: f.s3Key }));
                const buffer = await obj.Body?.transformToByteArray();
                return {
                    mimeType: f.mimeType,
                    data: buffer ? new Uint8Array(buffer).buffer : undefined,
                };
            })
        );

        const assistantText = await gemini({ text, files: fileParts });

        console.log("[messages/POST] Gemini raw output:", assistantText);

        let parsed: { events?: any[] } | null = null;
        if (assistantText) {
            try {
                parsed = JSON.parse(assistantText);
            } catch {
                console.warn("[messages/POST] Gemini did not return JSON.");
            }
        }

        let created = 0,
            updated = 0,
            deleted = 0;

        if (parsed?.events?.length) {
            for (const e of parsed.events) {
                if (e.action === "create") {
                    await prisma.event.create({
                        data: {
                            calendarId,
                            googleId: crypto.randomUUID(),
                            name: e.title,
                            description: e.description || null,
                            start: new Date(`${e.date}T${e.time || "00:00"}:00Z`),
                            end: new Date(`${e.date}T${e.end_time || e.time || "01:00"}:00Z`),
                            visibility: "DEFAULT",
                        },
                    });
                    created++;
                }
                if (e.action === "update" && e.id) {
                    await prisma.event.update({
                        where: { id: e.id },
                        data: {
                            name: e.title,
                            description: e.description || null,
                            start: new Date(`${e.date}T${e.time || "00:00"}:00Z`),
                            end: new Date(`${e.date}T${e.end_time || e.time || "01:00"}:00Z`),
                        },
                    });
                    updated++;
                }
                if (e.action === "delete" && e.id) {
                    await prisma.event.delete({ where: { id: e.id } });
                    deleted++;
                }
            }
        }

        const summary =
            created + updated + deleted > 0
                ? `✅ Created ${created}, Updated ${updated}, Deleted ${deleted} events.`
                : assistantText || "Failed to respond";

        const assistantMessage = await prisma.message.create({
            data: { calendarId, role: "ASSISTANT", content: summary },
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

        return NextResponse.json({ message: summary, messageId: assistantMessage.id });
    } catch (error: any) {
        console.error("=== POST /messages ERROR ===", error);
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
