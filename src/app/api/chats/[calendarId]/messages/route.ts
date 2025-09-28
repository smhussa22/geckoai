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
} from "@/app/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";

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

async function postCalendarData(calendarId: string, calendarData: GeminiResponse) {
  const results = { eventsAdded: 0, tasksAdded: 0, errors: [] as string[] };
  
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/calendars/${calendarId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: event.title,
          description: event.notes || null,
          location: event.location || null,
          start: startDateTime,
          end: endDateTime,
          timeZone: 'UTC',
        }),
      });

      if (response.ok) {
        results.eventsAdded++;
      } else {
        results.errors.push(`Event: ${event.title}`);
      }
    } catch (error) {
      results.errors.push(`Event: ${event.title}`);
    }
  }

  for (const task of calendarData.tasks || []) {
    try {
      const dueDateTime = task.time 
        ? `${task.due_date}T${task.time}:00`
        : `${task.due_date}T23:59:00`;

      const endDateTime = task.time
        ? `${task.due_date}T${addMinutes(task.time, 30)}:00`
        : `${task.due_date}T23:59:59`;

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL!}/api/calendars/${calendarId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          description: `Due: ${task.due_date}${task.time ? ` at ${task.time}` : ''}\n${task.notes || ''}`.trim(),
          start: dueDateTime,
          end: endDateTime,
          timeZone: 'UTC',
        }),
      });

      if (response.ok) {
        results.tasksAdded++;
      } else {
        results.errors.push(`Task: ${task.title}`);
      }
    } catch (error) {
      results.errors.push(`Task: ${task.title}`);
    }
  }

  return results;
}

function addOneHour(timeString: string): string {
  const [hours, minutes] = timeString.split(':').map(Number);
  const newHours = (hours + 1) % 24;
  return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function addMinutes(timeString: string, minutesToAdd: number): string {
  const [hours, minutes] = timeString.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + minutesToAdd;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
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

export async function POST(req: Request, { params }: { params: { calendarId: string } }) {
  try {
    const user = await authUserOrThrow();
    const { calendarId } = params;

    const { text, staged } = (await req.json()) as { text: string; staged?: StagedFile[] };
    if (!text?.trim()) {
      return NextResponse.json({ error: "need text" }, { status: 400 });
    }

    const userMessage = await prisma.message.create({
      data: { calendarId, role: "USER", content: text },
    });

    const committedFiles: StagedFile[] = [];
    for (const stagedFile of staged ?? []) {
      const key = s3CommittedAttachmentKey(user.id, calendarId, userMessage.id, stagedFile.fileName);
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
    
    console.log("[DEBUG] Gemini response:", assistantText);

    let displayText = assistantText;
    let calendarData: GeminiResponse | null = null;

    try {
      calendarData = JSON.parse(assistantText) as GeminiResponse;
      
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
      console.log("[DEBUG] Response is not JSON, treating as regular text");
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