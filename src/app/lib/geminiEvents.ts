// app/lib/geminiEvents.ts
import { gemini } from "@/app/lib/gemini";
import type { AIEventPlan } from "./chatTypes";

/**
 * Plan events with explicit "now" and "timeZone".
 * - Model returns ONLY JSON (no fences).
 * - Strong rules to avoid time shifting.
 */
export async function planEventsFromText(
  text: string,
  nowISO: string,
  timeZone: string
): Promise<AIEventPlan> {
  try {
    // Format current time in user's timezone for better context
    const now = new Date(nowISO);
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      weekday: 'long',
      hour12: true
    });
    const localTimeString = formatter.format(now);
    
    // FIX: Proper date calculation using Date methods
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    
    console.log(`[DEBUG] planEventsFromText starting:`, {
      nowISO,
      timeZone,
      localTimeString,
      today,
      tomorrow: tomorrowStr,
      inputText: text
    });
    
    const res = await gemini.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
You are a calendar planner that outputs ONLY JSON for a calendar executor.

CRITICAL TIMING RULES:
- Current date/time: ${nowISO} (UTC)
- In user's timezone (${timeZone}): ${localTimeString}
- When user says "10am-12pm", output EXACTLY "10:00:00" to "12:00:00" - DO NOT SHIFT TIMES
- When user says "today", use today's date: ${today}
- For relative times like "tomorrow", "next week", calculate from current date above
- PRESERVE EXACT TIMES: if input says "10:00 AM", output "10:00:00" not "11:00:00"

Context:
- User's calendar time zone (IANA): ${timeZone}
- Interpret all relative phrases (e.g., "today", "next Tuesday") in ${timeZone}.
- If an input gives a specific local time (like "7:00 PM"), DO NOT change it - use exactly "19:00:00".
- For deadlines at a single time (e.g., "11:59 PM"), set startAt == endAt at that local time.
- If an input provides a clear range (e.g., "7–9 PM"), preserve that exact range as "19:00:00" to "21:00:00".
- If you cannot safely infer a valid operation (missing times, unclear date), produce { "operations": [] }.

DATETIME FORMAT: Always use "YYYY-MM-DDTHH:mm:ss" format (24-hour time, local to ${timeZone})
- 10:00 AM = "10:00:00" NOT "11:00:00"  
- 2:00 PM = "14:00:00" NOT "15:00:00"
- 11:59 PM = "23:59:00" NOT "00:59:00"

Output EXACTLY this JSON shape (no extra keys, no prose, no markdown):
{
  "operations": [
    { "action": "create", "event": {
      "title": (optional string),
      "description": (optional string),
      "location": (optional string),
      "recurrence": (optional array of strings),
      "startAt": (string; "YYYY-MM-DDTHH:mm:ss" in ${timeZone}),
      "endAt": (string; "YYYY-MM-DDTHH:mm:ss" in ${timeZone})
    }},
    { "action": "update", "googleId": (string), "event": {
      "title": (optional string),
      "description": (optional string),
      "location": (optional string),
      "recurrence": (optional array of strings),
      "startAt": (optional string),
      "endAt": (optional string)
    }},
    { "action": "delete", "googleId": (string) }
  ]
}

Rules:
- Output ONLY JSON (no code fences, no commentary).
- Keys MUST be exactly: action, googleId, event, title, description, location, recurrence, startAt, endAt.
- If you cannot infer a valid operation, return: { "operations": [] }.
- Do not add full day events indicating when something "starts", only give proper events like the ones described specifically in documents.
- For something with just a due date, for example Test due at 11:59 PM, make the event start an hour before the due date. So for Test, make the event from 10:59 PM to 11:59 PM (22:59:00 to 23:59:00).
- For relative times (like "today 7–8pm"), resolve to full date-times in ${timeZone}.
- NEVER shift or change the hour/minute given - preserve exactly as stated.
- Never include placeholders or links.

EXAMPLES:
- Input: "Meeting 10am-12pm today" → startAt: "${today}T10:00:00", endAt: "${today}T12:00:00"
- Input: "Dinner 7pm tomorrow" → startAt: "${tomorrowStr}T19:00:00", endAt: "${tomorrowStr}T20:00:00"

INPUT:
${text}
`
            }
          ]
        }
      ],
      generationConfig: { responseMimeType: "application/json" }
    });

    const raw = res.response?.text?.() ?? "";
    console.log("[DEBUG] Gemini raw response:", raw);
    console.log("[DEBUG] Context used:", { nowISO, timeZone, localTimeString, today, tomorrow: tomorrowStr });

    const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "");
    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
      console.log("[DEBUG] Parsed operations:", JSON.stringify(parsed, null, 2));
    } catch (parseError) {
      console.error("[ERROR] JSON parse error:", parseError, "Raw:", cleaned);
      return { operations: [] };
    }

    if (!parsed || !Array.isArray(parsed.operations)) {
      console.error("[ERROR] Invalid response structure:", parsed);
      return { operations: [] };
    }

    // Enhanced server-side validation with time checking
    const ops = parsed.operations.filter((op: any, index: number) => {
      if (!op?.action) {
        console.warn(`[planEventsFromText] Op ${index}: missing action`);
        return false;
      }
      
      if (op.action === "create") {
        const ev = op.event;
        if (!ev || typeof ev.startAt !== "string" || typeof ev.endAt !== "string") {
          console.warn(`[planEventsFromText] Op ${index}: create missing startAt/endAt`);
          return false;
        }
        
        // Log the times being created for debugging
        console.log(`[DEBUG] Creating event: ${ev.title} from ${ev.startAt} to ${ev.endAt}`);
        return true;
      }
      
      if (op.action === "update") {
        const valid = typeof op.googleId === "string" && op.googleId && op.event && typeof op.event === "object";
        if (!valid) console.warn(`[planEventsFromText] Op ${index}: update missing googleId or event`);
        return valid;
      }
      
      if (op.action === "delete") {
        const valid = typeof op.googleId === "string" && op.googleId;
        if (!valid) console.warn(`[planEventsFromText] Op ${index}: delete missing googleId`);
        return valid;
      }
      
      return false;
    });

    console.log(`[DEBUG] Filtered ${ops.length}/${parsed.operations.length} operations`);
    return { operations: ops };
    
  } catch (e) {
    console.error("[ERROR] planEventsFromText error:", e);
    return { operations: [] };
  }
}