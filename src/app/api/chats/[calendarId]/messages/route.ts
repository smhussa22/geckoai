import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { authUserOrThrow } from "@/app/lib/getUser";
import { gemini } from "@/app/lib/gemini";
import {
    s3,
    s3WriteMessageJSON,
    s3CopyObject,
    s3DeleteObject,
    s3CommittedAttachmentKey,
    s3MessageKey,
    s3Bucket,
    s3ObjectToBase64,
    s3DeletePrefix,
    s3MessagesPrefix,
} from "@/app/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { cookies } from "next/headers";

type StagedFile = {
    tempId: string;
    fileName: string;
    mimeType: string;
    size: number;
    s3Key: string;
};

type GeminiEvent = {
    title: string;
    date: string;
    time?: string | null;
    end_time?: string | null;
    location?: string | null;
    notes?: string | null;
    recurrence: {
        frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "NONE";
        interval: number;
        byDay: string[];
        until: string | null;
    };
};

type GeminiTask = {
    title: string;
    due_date: string;
    time?: string | null;
    notes?: string | null;
};

type GeminiResponse = {
    events: GeminiEvent[];
    tasks: GeminiTask[];
};

function buildRRule(event: GeminiEvent): string[] | undefined {
    if (!event.recurrence || event.recurrence.frequency === "NONE") return undefined;

    const parts: string[] = [`FREQ=${event.recurrence.frequency}`];

    if (event.recurrence.interval && event.recurrence.interval > 1) {
        parts.push(`INTERVAL=${event.recurrence.interval}`);
    }

    // For WEEKLY frequency, BYDAY is REQUIRED by Google Calendar
    if (event.recurrence.frequency === "WEEKLY") {
        if (!event.recurrence.byDay || event.recurrence.byDay.length === 0) {
            console.error(`[ERROR] WEEKLY recurrence missing BYDAY for event: ${event.title}`);
            return undefined; // Don't create invalid recurrence
        }
        parts.push(`BYDAY=${event.recurrence.byDay.join(",")}`);
    } else if (event.recurrence.byDay && event.recurrence.byDay.length > 0) {
        // For other frequencies, only add if provided
        parts.push(`BYDAY=${event.recurrence.byDay.join(",")}`);
    }

    if (event.recurrence.until) {
        parts.push(`UNTIL=${event.recurrence.until.replace(/-/g, "")}T235959Z`);
    }

    return [`RRULE:${parts.join(";")}`];
}

async function postCalendarData(calendarId: string, calendarData: GeminiResponse) {
    const results = { eventsAdded: 0, tasksAdded: 0, errors: [] as string[] };
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    for (const event of calendarData.events || []) {
        try {
            const startDateTime = event.time
                ? `${event.date}T${event.time}:00`
                : `${event.date}T00:00:00`;

            const endDateTime = event.end_time
                ? `${event.date}T${event.end_time}:00`
                : event.time
                  ? `${event.date}T${addOneHour(event.time)}:00`
                  : `${event.date}T23:59:59`;

            const recurrence = buildRRule(event);

            console.log("[DEBUG] Posting event:", {
                title: event.title,
                start: startDateTime,
                end: endDateTime,
                recurrence,
                geminiRecurrence: event.recurrence,
            });

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/calendars/${calendarId}/events`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        cookie: cookieHeader,
                    },
                    body: JSON.stringify({
                        title: event.title,
                        description: event.notes || null,
                        location: event.location || null,
                        start: startDateTime,
                        end: endDateTime,
                        timeZone: "UTC",
                        recurrence,
                    }),
                }
            );

            const responseText = await response.text();
            console.log("[DEBUG] Calendar API response:", {
                status: response.status,
                ok: response.ok,
                statusText: response.statusText,
                body: responseText,
            });

            if (response.ok) {
                results.eventsAdded++;
            } else {
                console.error("[ERROR] Failed to add event:", {
                    event: event.title,
                    status: response.status,
                    error: responseText,
                    sentRecurrence: recurrence,
                });
                results.errors.push(`Event: ${event.title} (${response.status})`);
            }
        } catch (error) {
            console.error("[ERROR] Exception posting event:", error);
            results.errors.push(`Event: ${event.title}`);
        }
    }

    for (const task of calendarData.tasks || []) {
        try {
            const dueDateTime = task.time
                ? `${task.due_date}T${task.time}:00`
                : `${task.due_date}T23:59:00`;

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/calendars/${calendarId}/tasks`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        cookie: cookieHeader,
                    },
                    body: JSON.stringify({
                        title: task.title,
                        notes: task.notes || "",
                        due: dueDateTime ? new Date(dueDateTime).toISOString() : undefined,
                    }),
                }
            );

            if (response.ok) {
                results.tasksAdded++;
            } else {
                const responseText = await response.text();
                console.error("[ERROR] Failed to add task:", {
                    task: task.title,
                    status: response.status,
                    error: responseText,
                });
                results.errors.push(`Task: ${task.title}`);
            }
        } catch (error) {
            console.error("[ERROR] Exception posting task:", error);
            results.errors.push(`Task: ${task.title}`);
        }
    }

    return results;
}

function addOneHour(timeString: string): string {
    const [hours, minutes] = timeString.split(":").map(Number);
    const newHours = (hours + 1) % 24;
    return `${newHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

function addMinutes(timeString: string, minutesToAdd: number): string {
    const [hours, minutes] = timeString.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + minutesToAdd;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`;
}

export async function GET(req: Request, ctx: { params: Promise<{ calendarId: string }> }) {
    const { calendarId } = await ctx.params;

    try {
        const user = await authUserOrThrow();

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
                    calendarData: json.calendarData || null,
                });
            } catch {
                messages.push({
                    id: message.id,
                    role: message.role.toLowerCase(),
                    content: message.content,
                    createdAt: message.createdAt.toISOString(),
                    attachments: [],
                    calendarData: null,
                });
            }
        }

        return NextResponse.json({ messages });
    } catch (error: any) {
        console.error("GET /messages error:", error);
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

        const { text, staged } = (await req.json()) as { text: string; staged?: StagedFile[] };
        if (!text?.trim()) {
            return NextResponse.json({ error: "need text" }, { status: 400 });
        }

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
                const base64 = await s3ObjectToBase64(f.s3Key);
                return {
                    mimeType: f.mimeType,
                    data: Uint8Array.from(Buffer.from(base64, "base64")).buffer,
                };
            })
        );

        const assistantText = (await gemini({ text, files: fileParts })) ?? "";

        console.log("----- GEMINI RAW RESPONSE START -----");
        console.log(assistantText);
        console.log("----- GEMINI RAW RESPONSE END -----");

        let displayText = assistantText;
        let calendarData: GeminiResponse | null = null;

        let clean = assistantText.trim();

        try {
            if (clean.startsWith("```")) {
                clean = clean.replace(/^```(?:json|JSON)?\s*\n?/i, "");
                clean = clean.replace(/\n?\s*```\s*$/i, "");
                clean = clean.trim();
            }

            console.log("[DEBUG] Cleaned response:", clean);

            calendarData = JSON.parse(clean) as GeminiResponse;

            console.log("[DEBUG] Parsed calendar data:", JSON.stringify(calendarData, null, 2));

            const results = await postCalendarData(calendarId, calendarData);

            const totalAdded = results.eventsAdded + results.tasksAdded;
            const totalErrors = results.errors.length;

            if (totalAdded > 0) {
                displayText = `Added ${results.eventsAdded} events and ${results.tasksAdded} tasks to your calendar.`;
                if (totalErrors > 0) {
                    displayText += ` (${totalErrors} items failed)`;
                }
            } else {
                displayText = "No calendar items were added.";
                if (totalErrors > 0) {
                    displayText += ` ${totalErrors} items failed to process.`;
                }
            }
        } catch (parseError) {
            console.log("[DEBUG] Response could not be parsed as JSON:", parseError);
            console.log("[DEBUG] Raw response:", assistantText);
            console.log("[DEBUG] Cleaned response attempt:", clean);
        }

        const assistantMessage = await prisma.message.create({
            data: { calendarId, role: "ASSISTANT", content: displayText },
        });

        await s3WriteMessageJSON(user.id, calendarId, assistantMessage.id, {
            id: assistantMessage.id,
            role: "assistant",
            content: displayText,
            calendarId,
            createdAt: assistantMessage.createdAt.toISOString(),
            attachments: [],
            calendarData: calendarData,
            rawResponse: assistantText,
        });

        await prisma.calendar.update({
            where: { id: calendarId },
            data: { lastMessageAt: new Date() },
        });

        return NextResponse.json({
            message: displayText,
            messageId: assistantMessage.id,
            calendarData: calendarData,
        });
    } catch (error: any) {
        console.error("POST /messages error:", error);
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