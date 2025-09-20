import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { authUserOrThrow } from "@/app/lib/getUser";
import { gemini, extractEventsFromText } from "@/app/lib/gemini";
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
import { parsePdfRaw, parsePptxRaw } from "@/app/lib/parser";

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

        const url = new URL(req.url);
        const all = url.searchParams.get("all") === "true";
        const takeParam = Number(url.searchParams.get("take") ?? 50);
        const take = all ? 1000 : Math.min(takeParam, 100);

        const rows = await prisma.message.findMany({
            where: { calendarId },
            orderBy: { createdAt: "asc" },
            take,
        });

        const messages: any[] = [];
        for (const message of rows) {
            try {
                const key = s3MessageKey(user.id, calendarId, message.id);
                const obj = await s3.send(new GetObjectCommand({ Bucket: s3Bucket, Key: key }));
                const json = JSON.parse(await obj.Body!.transformToString("utf-8"));

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
        console.error("GET messages error:", e);
        return NextResponse.json({ error: e?.message ?? "Internal Server Error" }, { status: 500 });
    }
}

async function extractAttachmentText(file: {
    fileName: string;
    mimeType: string;
    s3Key: string;
}): Promise<string | null> {
    try {
        console.log(`Extracting text from file: ${file.fileName} (${file.mimeType})`);
        
        const object = await s3.send(new GetObjectCommand({ Bucket: s3Bucket, Key: file.s3Key }));
        const buffer = Buffer.from(await object.Body!.transformToByteArray());

        console.log(`Downloaded file buffer size: ${buffer.length}`);

        if (file.mimeType === "application/pdf") {
            const { chunks } = await parsePdfRaw(buffer);
            const text = chunks.map((chunk) => chunk.text).join("\n\n");
            console.log(`PDF text extracted, length: ${text.length}`);
            return text;
        }

        if (file.mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
            const { chunks } = await parsePptxRaw(buffer);
            const text = chunks.map((chunk) => chunk.text).join("\n\n");
            console.log(`PPTX text extracted, length: ${text.length}`);
            return text;
        }

        if (file.mimeType.startsWith("text/")) {
            const text = buffer.toString("utf-8");
            console.log(`Text file extracted, length: ${text.length}`);
            return text;
        }

        console.log(`Unsupported file type: ${file.mimeType}`);
        return null;
    } catch (error: any) {
        console.error(`Failed to extract text from ${file.fileName}:`, error);
        return `[Failed to extract text from ${file.fileName}: ${error.message}]`;
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

        const calendar = await prisma.calendar.findUnique({
            where: { id: calendarId },
            select: { timeZone: true },
        });
        const timeZone = calendar?.timeZone || "UTC";
        const todayISO = new Date().toISOString().slice(0, 10);

        const previousMessages = await prisma.message.findMany({
            where: { calendarId },
            orderBy: { createdAt: "asc" },
        });

        const history: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];
        for (const message of previousMessages) {
            const key = s3MessageKey(user.id, calendarId, message.id);
            let parts: Array<{ text: string }> = [{ text: message.content }];

            try {
                const obj = await s3.send(new GetObjectCommand({ Bucket: s3Bucket, Key: key }));
                const json = JSON.parse(await obj.Body!.transformToString("utf-8"));

                if (json.attachments?.length) {
                    const attachmentsText =
                        "Attached files:\n" +
                        json.attachments
                            .map((a: any) => `- ${a.fileName || a.filename} [${a.mimeType}]`)
                            .join("\n");
                    parts = [{ text: message.content }, { text: attachmentsText }];
                }
            } catch (historyError) {
                console.error(`Failed to load history for message ${message.id}:`, historyError);
            }

            history.push({ role: message.role.toLowerCase() === "user" ? "user" : "model", parts });
        }

        const userMessage = await prisma.message.create({
            data: { calendarId, role: "USER", content: text },
        });

        const committedFiles: {
            fileName: string;
            mimeType: string;
            size: number;
            s3Key: string;
        }[] = [];
        
        for (const stagedFile of staged ?? []) {
            try {
                const key = s3CommittedAttachmentKey(
                    user.id,
                    calendarId,
                    userMessage.id,
                    stagedFile.fileName
                );
                await s3CopyObject(stagedFile.s3Key, key, stagedFile.mimeType);
                await s3DeleteObject(stagedFile.s3Key);

                committedFiles.push({
                    fileName: stagedFile.fileName,
                    mimeType: stagedFile.mimeType,
                    size: stagedFile.size,
                    s3Key: key,
                });
            } catch (fileError) {
                console.error(`Failed to commit file ${stagedFile.fileName}:`, fileError);
            }
        }

        await s3WriteMessageJSON(user.id, calendarId, userMessage.id, {
            id: userMessage.id,
            role: "user",
            content: userMessage.content,
            calendarId,
            createdAt: userMessage.createdAt.toISOString(),
            attachments: committedFiles,
        });

        const parts: Array<{ text: string }> = [{ text }];
        for (const file of committedFiles) {
            const extracted = await extractAttachmentText(file);
            if (extracted) {
                parts.push({ text: `Extracted from ${file.fileName}:\n\n${extracted}` });
            } else {
                parts.push({ text: `Attached (not parsed): ${file.fileName} [${file.mimeType}]` });
            }
        }

        const systemPrompt =`
            You are an assistant that extracts important dates, deadlines, or events from course syllabi, documents, and text.
            Today's date is ${todayISO}.
            Timezone: ${timeZone}

            INSTRUCTIONS:
            1. Extract ALL dates, deadlines, assignments, exams, and events mentioned
            2. Convert relative dates like "tomorrow", "next week", "Week 3" into specific yyyy-mm-dd format
            3. If only a day/date is mentioned without year, assume current academic year.
            4. For times: use 12-hour format (e.g., "11:59 PM") or 24-hour format (e.g., "23:59")
            5. For assignments/quizzes without specific times, assume "11:59 PM" as deadline. For things with just a deadline, like a test, just give purely an end time.
            6. Include course codes, assignment numbers, and specific names in titles

            OUTPUT FORMAT (one block per event):

            Title: <specific title with course info if available>
            Date: <yyyy-mm-dd>
            StartTime: <hh:mm AM/PM or leave empty if not specified>, EXAMPLE: 10:00 PM / 22:00
            EndTime: <hh:mm AM/PM or leave empty if not specified>, EXAMPLE: 11:59 PM / 23:59
            Location: <if specified>
            TimeZone: ${timeZone}
            Recurrence: <if it's a recurring event>

            EXAMPLES:
            Title: MCS 2100 Quiz 2
            Date: 2025-09-21
            StartTime: 
            EndTime: 11:59 PM
            Location: 
            TimeZone: ${timeZone}
            Recurrence:

            Title: Weekly Discussion Board Post
            Date: 2025-09-21
            StartTime:
            EndTime: 11:59 PM
            Location: Online
            TimeZone: ${timeZone}
            Recurrence: Weekly
            `;


        console.log("Calling Gemini with text length:", parts.map(p => p.text).join("\n\n").length);
        
        const assistantText = await extractEventsFromText(
            parts.map((p) => p.text).join("\n\n"), 
            systemPrompt
        ).catch((error) => {
            console.error("Gemini call failed:", error);
            return "Sorry, I encountered an error while processing your request. Please try again.";
        });

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

        return NextResponse.json({ message: assistantText, messageId: assistantMessage.id });
    } catch (error: any) {
        console.error("=== POST /messages ERROR ===");
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);

        if (error.response) {
            console.error("Gemini response:", error.response);
        }
        if (error.status) {
            console.error("Error status:", error.status);
        }
        if (error.details) {
            console.error("Error details:", error.details);
        }

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