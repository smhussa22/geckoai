"use server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/app/lib/prisma";
import { planEventsFromText } from "@/app/lib/geminiEvents";
import type { AIEventResult, AIEventPlan } from "@/app/lib/chatTypes";

const sessionSecret = new TextEncoder().encode(process.env.SESSION_SECRET!);

async function readErrorDetail(res: Response) {
  try {
    const txt = await res.text();
    try { return JSON.parse(txt); } catch { return txt; }
  } 
  catch { 
    return undefined;
  }
}

class HttpError extends Error {
  status?: number;
  detail?: unknown;
  constructor(message: string, status?: number, detail?: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

function looksISODateTimePrefix(s: string) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?/.test(s);
}

function parseAITimeString(timeString: string, timezone: string): string | null {
  console.log(`[parseAITimeString] Parsing: "${timeString}" in timezone: ${timezone}`);
  
  if (!timeString || typeof timeString !== "string") return null;
  
  const cleaned = timeString.trim();
  
  // Case 1: Already in ISO format (YYYY-MM-DDTHH:mm:ss or YYYY-MM-DDTHH:mm)
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(cleaned)) {
    const result = cleaned.includes(':00') ? cleaned : cleaned + ':00';
    console.log(`[parseAITimeString] ISO format: "${timeString}" → "${result}"`);
    return result;
  }
  
  // Case 2: Try to parse various formats the AI might output
  const patterns = [
    // "2025-09-04 10:00:00"
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/,
    // "2025-09-04 10:00"
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2})$/,
    // "September 4, 2025 10:00 AM"
    /^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)?$/i,
    // "Sep 4 2025 10:00 AM"
    /^([A-Za-z]{3})\s+(\d{1,2})\s+(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)?$/i,
  ];
  
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      try {
        let year, month, day, hour, minute, second = '00', ampm;
        
        if (pattern.source.includes('([A-Za-z]+)')) {
          // Month name format
          const monthMap: Record<string, string> = {
            january: '01', jan: '01', february: '02', feb: '02', march: '03', mar: '03',
            april: '04', apr: '04', may: '05', june: '06', jun: '06', july: '07', jul: '07',
            august: '08', aug: '08', september: '09', sep: '09', october: '10', oct: '10',
            november: '11', nov: '11', december: '12', dec: '12'
          };
          
          const monthName = match[1].toLowerCase();
          month = monthMap[monthName];
          if (!month) continue;
          
          day = match[2].padStart(2, '0');
          year = match[3];
          hour = parseInt(match[4]);
          minute = match[5];
          ampm = match[6];
        } else {
          // Numeric format
          year = match[1];
          month = match[2];
          day = match[3];
          hour = parseInt(match[4]);
          minute = match[5];
          second = match[6] || '00';
          ampm = match[7];
        }
        
        // Handle AM/PM
        if (ampm) {
          const period = ampm.toUpperCase();
          if (period === 'AM' && hour === 12) hour = 0;
          else if (period === 'PM' && hour < 12) hour += 12;
        }
        
        const hourStr = hour.toString().padStart(2, '0');
        const result = `${year}-${month}-${day}T${hourStr}:${minute}:${second}`;
        
        console.log(`[parseAITimeString] Parsed with pattern: "${timeString}" → "${result}"`);
        return result;
      } catch (error) {
        console.error(`[parseAITimeString] Error parsing with pattern:`, error);
        continue;
      }
    }
  }
  
  console.error(`[parseAITimeString] Failed to parse: "${timeString}"`);
  return null;
}

function validRangeISOAllowZero(startLocal?: string | null, endLocal?: string | null) {
  console.log(`[validRangeISOAllowZero] Validating range: "${startLocal}" to "${endLocal}"`);
  
  const a = startLocal ? Date.parse(startLocal + "Z") : NaN;
  const b = endLocal ? Date.parse(endLocal + "Z") : NaN;
  
  const isValidA = Number.isFinite(a);
  const isValidB = Number.isFinite(b);
  const isValidRange = isValidA && isValidB && a <= b;
  
  console.log(`[validRangeISOAllowZero] Results:`, {
    startValid: isValidA,
    endValid: isValidB,
    startParsed: isValidA ? new Date(a).toISOString() : 'invalid',
    endParsed: isValidB ? new Date(b).toISOString() : 'invalid',
    isValidRange
  });
  
  return isValidRange;
}

export async function POST(req: Request, ctx: { params: Promise<{ calendarId: string }> }) {
  
  const { calendarId } = await ctx.params;

  const session = (await cookies()).get("ga_session")?.value;
  if (!session) return NextResponse.json({ error: "METHOD: EventsAI/POST, Error: Unauthorized" }, { status: 401 });

  try {

    const { payload } = await jwtVerify(session, sessionSecret);
    const userId = payload.userId as string;

    const token = await prisma.googleToken.findUnique({ where: { userId } });
    if (!token) return NextResponse.json({ error: "METHOD: EventsAI/POST, Error: No Google Token" }, { status: 401 });

    const calendar = await prisma.calendar.findFirst({
      where: { id: calendarId, ownerId: userId },
      select: { googleId: true },
    });
    if (!calendar) return NextResponse.json({ error: "METHOD: EventsAI/POST, Error: Calendar not found" }, { status: 404 });
    
    let body: { text?: string; timeZone?: string } | null = null;
    try { 
      body = (await req.json()) as { text?: string; timeZone?: string } | null; 
    } 
    catch {}

    if (!body?.text) return NextResponse.json({ error: "METHOD: EventsAI/POST, Error: No source text" }, { status: 400 });
    
    let timezone = (body.timeZone && body.timeZone.trim()) || "";
    
    if (!timezone) {
      const tzRes = await fetch("https://www.googleapis.com/calendar/v3/users/me/settings/timezone", {
        headers: { Authorization: `Bearer ${token.accessToken}` },
      });
      if (tzRes.ok) {
        const tzData = await tzRes.json().catch(() => null);
        timezone = tzData?.value || "UTC";
      } else {
        timezone = "UTC";
      }
    }

    console.log(`[EventsAI] Using timezone: ${timezone}`);

    // >>> pass "now" and tz into planner
    const nowISO = new Date().toISOString();
    console.log(`[EventsAI] Current time: ${nowISO}`);
    
    const plan: AIEventPlan = await planEventsFromText(body.text, nowISO, timezone);

    console.log(`[EventsAI] Plan operations: ${Array.isArray(plan?.operations) ? plan.operations.length : 0}`);

    const fetchUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar.googleId)}/events`;
    const headers = {
      Authorization: `Bearer ${token.accessToken}`,
      "Content-Type": "application/json",
    };

    const result: AIEventResult & {
      errors: Array<
        { action?: string; googleId?: string; message: string } & { index?: number; status?: number; detail?: unknown }
      >;
    } = { created: [], updated: [], deleted: [], errors: [] };

    // Pre-guard: if model tried update/delete without id, surface a clear message
    const missingIdIdxs: number[] = [];
    (plan.operations ?? []).forEach((op: any, i: number) => {
      if ((op?.action === "update" || op?.action === "delete") && !op?.googleId) missingIdIdxs.push(i);
    });
    for (const i of missingIdIdxs) {
      result.errors.push({
        index: i,
        action: (plan.operations as any[])[i]?.action ?? "unknown",
        message: "Can't perform update/delete without a specific event id. Use the Search/Picker to select an event.",
      });
    }

    // Execute the rest
    for (let i = 0; i < (plan.operations?.length ?? 0); i++) {
      const op = (plan.operations as any[])[i];

      // skip the pre-flagged missing id ops
      if ((op?.action === "update" || op?.action === "delete") && !op?.googleId) continue;

      try {
        if (op.action === "create") {
          console.log(`[EventsAI] Creating event with times: "${op.event?.startAt}" to "${op.event?.endAt}"`);
          
          const startLocal = parseAITimeString(op.event?.startAt, timezone);
          const endLocal   = parseAITimeString(op.event?.endAt, timezone);
          
          if (!startLocal || !endLocal) {
            throw new Error(`Missing startAt or endAt (raw: ${op.event?.startAt} | ${op.event?.endAt})`);
          }
          if (!validRangeISOAllowZero(startLocal, endLocal)) {
            throw new Error(
              `Invalid startAt/endAt (raw: ${op.event?.startAt} → ${startLocal}, ${op.event?.endAt} → ${endLocal})`
            );
          }

          const payload = {
            summary: (op.event?.title ?? "Untitled").trim(),
            description: op.event?.description || undefined,
            location: op.event?.location || undefined,
            start: { dateTime: startLocal, timeZone: timezone },
            end:   { dateTime: endLocal,   timeZone: timezone },
            recurrence: op.event?.recurrence,
          };

          console.log(`[EventsAI] Creating event payload:`, payload);

          const response = await fetch(fetchUrl, { method: "POST", headers, body: JSON.stringify(payload) });
          if (!response.ok) {
            const detail = await readErrorDetail(response);
            throw new HttpError(`create failed: ${response.status} ${response.statusText}`, response.status, detail);
          }

          const data = await response.json();

          const startIso = data.start?.dateTime
            ? new Date(data.start.dateTime)
            : data.start?.date ? new Date(`${data.start.date}T00:00:00.000Z`) : null;
          const endIso = data.end?.dateTime
            ? new Date(data.end.dateTime)
            : data.end?.date ? new Date(`${data.end.date}T00:00:00.000Z`) : null;

          if (startIso && endIso) {
            await prisma.event.upsert({
              where: { calendarId_googleId: { calendarId, googleId: data.id } },
              update: { name: data.summary ?? "Untitled", description: data.description ?? null, start: startIso, end: endIso },
              create: { calendarId, googleId: data.id, name: data.summary ?? "Untitled", description: data.description ?? null, start: startIso, end: endIso },
            });
          }

          result.created.push({ googleId: data.id, htmlLink: data.htmlLink });
        }

        if (op.action === "update") {
          const patch: any = {};
          if (op.event?.title !== undefined) patch.summary = (op.event.title ?? "").trim();
          if (op.event?.description !== undefined) patch.description = op.event.description ?? undefined;
          if (op.event?.location !== undefined) patch.location = op.event.location ?? undefined;
          if (op.event?.recurrence !== undefined) patch.recurrence = op.event.recurrence ?? undefined;

          let startLocal: string | null | undefined;
          let endLocal: string | null | undefined;

          if (op.event?.startAt) {
            startLocal = parseAITimeString(op.event.startAt, timezone);
            if (!startLocal) throw new Error(`Invalid startAt (${op.event.startAt})`);
          }
          if (op.event?.endAt) {
            endLocal = parseAITimeString(op.event.endAt, timezone);
            if (!endLocal) throw new Error(`Invalid endAt (${op.event.endAt})`);
          }
          if (startLocal && endLocal && !validRangeISOAllowZero(startLocal, endLocal)) {
            throw new Error(
              `Invalid startAt/endAt times (raw: ${op.event?.startAt} → ${startLocal}, ${op.event?.endAt} → ${endLocal})`
            );
          }
          if (startLocal) patch.start = { dateTime: startLocal, timeZone: timezone };
          if (endLocal)   patch.end   = { dateTime: endLocal,   timeZone: timezone };

          console.log(`[EventsAI] Updating event ${op.googleId} with patch:`, patch);

          const response = await fetch(`${fetchUrl}/${encodeURIComponent(op.googleId)}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify(patch),
          });
          if (!response.ok) {
            const detail = await readErrorDetail(response);
            throw new HttpError(`update failed: ${response.status} ${response.statusText}`, response.status, detail);
          }

          const data = await response.json();

          const startIso = data.start?.dateTime
            ? new Date(data.start.dateTime)
            : data.start?.date ? new Date(`${data.start.date}T00:00:00.000Z`) : null;
          const endIso = data.end?.dateTime
            ? new Date(data.end.dateTime)
            : data.end?.date ? new Date(`${data.end.date}T00:00:00.000Z`) : null;

          if (startIso && endIso) {
            await prisma.event.upsert({
              where: { calendarId_googleId: { calendarId, googleId: op.googleId } },
              update: { name: data.summary ?? "", description: data.description ?? null, start: startIso, end: endIso },
              create: { calendarId, googleId: op.googleId, name: data.summary ?? "", description: data.description ?? null, start: startIso, end: endIso },
            });
          }

          result.updated.push({ googleId: op.googleId, htmlLink: data.htmlLink });
        }

        if (op.action === "delete") {
          const response = await fetch(`${fetchUrl}/${encodeURIComponent(op.googleId)}`, {
            method: "DELETE",
            headers: { Authorization: headers.Authorization },
          });
          if (!response.ok) {
            const detail = await readErrorDetail(response);
            throw new HttpError(`delete failed: ${response.status} ${response.statusText}`, response.status, detail);
          }

          await prisma.event.deleteMany({ where: { calendarId, googleId: op.googleId } });
          result.deleted.push({ googleId: op.googleId });
        }
      } catch (error: any) {
        console.error(
          `[EventsAI] op#${i} (${op?.action ?? "unknown"}) failed: ${error?.message ?? String(error)}`,
          { googleId: op?.googleId, status: error?.status, detail: error?.detail, operation: op }
        );

        result.errors.push({
          index: i,
          action: op?.action ?? "unknown",
          googleId: op?.googleId,
          message: error?.message ?? String(error),
          status: error?.status,
          detail: error?.detail,
        });
      }
    }

    console.log(
      `[EventsAI] Summary: created=${result.created.length}, updated=${result.updated.length}, deleted=${result.deleted.length}, errors=${result.errors.length}`
    );

    return NextResponse.json({ plan, result }, { status: 200 });
  } catch (error: any) {
    console.error(`[EventsAI] Fatal: ${error?.message ?? String(error)}`, { detail: error?.detail });
    return NextResponse.json(
      { error: `METHOD: EventsAI/POST, Error: ${error?.message ?? String(error)}` },
      { status: 500 }
    );
  }
}