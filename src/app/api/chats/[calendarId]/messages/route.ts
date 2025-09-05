"use server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/app/lib/prisma";
import { s3, s3Bucket, s3ReadObjectAsString, s3WriteObject } from "@/app/lib/s3";
import { ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import type { ListObjectsV2CommandOutput } from "@aws-sdk/client-s3";
import { s3KeyMessageJson, s3PrefixChat } from "@/app/lib/s3Keys";
import { ChatMessageJSON, ChatRole } from "@/app/lib/chatTypes";
import { randomUUID } from "crypto";
import { gemini } from "@/app/lib/gemini";

const sessionSecret = new TextEncoder().encode(process.env.SESSION_SECRET!);

// Map chat roles to Gemini roles
function toGeminiRole(role: ChatRole): "user" | "model" {
  return role === "assistant" ? "model" : "user";
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ calendarId: string }> }
) {
  const { calendarId } = await ctx.params;

  const session = (await cookies()).get("ga_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { payload } = await jwtVerify(session, sessionSecret);
  const userId = payload.userId as string;

  const calendar = await prisma.calendar.findFirst({
    where: { id: calendarId, ownerId: userId },
    select: { id: true },
  });
  if (!calendar) return NextResponse.json({ error: "Calendar not found" }, { status: 404 });

  const body = (await req.json()) as { content?: string; role?: ChatRole; attachmentIds?: string[] };
  const content = (body?.content ?? "").trim();
  if (!content) return NextResponse.json({ error: "Message content needed" }, { status: 400 });

  const userMsgId = randomUUID();
  const createdAt = new Date().toISOString();
  const userMessage: ChatMessageJSON = {
    id: userMsgId,
    role: "user",
    content,
    calendarId: calendar.id,
    createdAt,
    attachments: [], // persisted separately if you store attachments on messages
  };

  const userKey = s3KeyMessageJson(userId, calendar.id, userMsgId);
  await s3WriteObject(userKey, JSON.stringify(userMessage), "application/json");

  await prisma.calendar.update({
    where: { id: calendar.id },
    data: { lastMessageAt: new Date(createdAt) },
  });

  // -------- Load recent context (no date/time anchoring) --------
  let recent: ChatMessageJSON[] = [];
  try {
    const prefix = `${s3PrefixChat(userId, calendar.id)}/messages/`;
    const listed = await s3.send(new ListObjectsV2Command({ Bucket: s3Bucket, Prefix: prefix }));
    const keys = (listed.Contents ?? [])
      .map(o => o.Key!)
      .filter(k => k.endsWith("/message.json"));

    const msgs: ChatMessageJSON[] = [];
    for (const k of keys) {
      try {
        const text = await s3ReadObjectAsString(k);
        if (!text) continue;
        const parsed = JSON.parse(text) as ChatMessageJSON;
        if (parsed && parsed.id && parsed.role && typeof parsed.content === "string") {
          msgs.push(parsed);
        }
      } catch {}
    }
    msgs.sort((a, b) => Date.parse(a.createdAt || "") - Date.parse(b.createdAt || ""));
    recent = msgs.slice(-10);
  } catch {}

  const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

  // Small guardrail: keep chat focused on calendar, but no dates.
  contents.push({
    role: "user",
    parts: [{
      text: [
        "You are a calendar assistant.",
        "Keep replies short and focused on calendar tasks.",
        "If the message is not about calendar events, say briefly that you only handle calendar tasks.",
      ].join("\n")
    }]
  });

  for (const m of recent) {
    const role = toGeminiRole(m.role);
    const text = m.role === "system" ? `[System]\n${m.content}` : m.content;
    contents.push({ role, parts: [{ text }] });
  }

  // current user message last
  contents.push({ role: "user", parts: [{ text: content }] });

  // -------- Call Gemini --------
  let assistantMessage: ChatMessageJSON | null = null;
  try {
    const gen = await gemini.generateContent({ contents });
    const aiText = (gen.response?.text?.() ?? "").trim();

    if (aiText) {
      const asstId = randomUUID();
      const asstCreatedAt = new Date().toISOString();
      assistantMessage = {
        id: asstId,
        role: "assistant",
        content: aiText,
        calendarId: calendar.id,
        createdAt: asstCreatedAt,
        attachments: [],
      };
      const asstKey = s3KeyMessageJson(userId, calendar.id, asstId);
      await s3WriteObject(asstKey, JSON.stringify(assistantMessage), "application/json");

      await prisma.calendar.update({
        where: { id: calendar.id },
        data: { lastMessageAt: new Date(asstCreatedAt) },
      });
    }
  } catch {
    assistantMessage = null;
  }

  return NextResponse.json(
    assistantMessage ? { user: userMessage, assistant: assistantMessage } : userMessage,
    { status: 201 }
  );
}

export async function GET(req: Request, ctx: { params: Promise<{ calendarId: string }> }) {
  const { calendarId } = await ctx.params;

  const session = (await cookies()).get("ga_session")?.value;
  if (!session) return NextResponse.json({ error: "METHOD: CalendarID/Messages/POST, Error: Unauthorized"}, { status: 401 });

  const { payload } = await jwtVerify(session, sessionSecret);
  const userId = payload.userId as string;

  const calendar = await prisma.calendar.findFirst({
    where: { id: calendarId, ownerId: userId },
    select: { id: true },
  });
  if (!calendar) return NextResponse.json({ error: "METHOD: CalendarID/Messages/POST, Error: Calendar not found"}, { status: 404 });

  const prefix = `${s3PrefixChat(userId, calendar.id)}/messages/`;
  const listed = await s3.send(new ListObjectsV2Command({ Bucket: s3Bucket, Prefix: prefix }));
  const keys = (listed.Contents ?? []).map((object) => object.Key!).filter((key) => key.endsWith("/message.json")) || [];

  const messages: ChatMessageJSON[] = [];
  for (const key of keys) {
    if (!key) continue;
    try {
      const text = await s3ReadObjectAsString(key);
      if (!text) continue;
      const parsed = JSON.parse(text) as ChatMessageJSON;
      const valid =
        parsed &&
        typeof parsed.id === "string" &&
        typeof parsed.role === "string" &&
        typeof parsed.content === "string";
      if (valid) messages.push(parsed);
    } catch {}
  }

  messages.sort((a, b) => Date.parse(a.createdAt || "") - Date.parse(b.createdAt || ""));
  return NextResponse.json({ messages }, { status: 200 });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ calendarId: string }> }) {
  const { calendarId } = await ctx.params;

  const session = (await cookies()).get("ga_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { payload } = await jwtVerify(session, sessionSecret);
  const userId = payload.userId as string;

  const calendar = await prisma.calendar.findFirst({
    where: { id: calendarId, ownerId: userId },
    select: { id: true },
  });
  if (!calendar) return NextResponse.json({ error: "Calendar not found" }, { status: 404 });

  try {
    const prefix = `${s3PrefixChat(userId, calendar.id)}/messages/`;
    let token: string | undefined = undefined;

    do {
      const listed: ListObjectsV2CommandOutput = await s3.send(
        new ListObjectsV2Command({ Bucket: s3Bucket, Prefix: prefix, ContinuationToken: token })
      );
      token = listed.NextContinuationToken ?? undefined;
      const keys = (listed.Contents ?? []).map((object) => object.Key!).filter(Boolean);
      if (keys.length) {
        await s3.send(
          new DeleteObjectsCommand({
            Bucket: s3Bucket,
            Delete: { Objects: keys.map((Key) => ({ Key })) },
          })
        );
      }
    } while (token);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: `Failed to clear chat: ${error}` }, { status: 500 });
  }
}
