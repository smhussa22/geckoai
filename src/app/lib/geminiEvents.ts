// app/lib/geminiEvents.ts
import { gemini } from "@/app/lib/gemini";
import type { AIEventPlan } from "./chatTypes";

/**
 * Turn freeform text into a strict AIEventPlan JSON:
 * { "operations": [ { "action": "create"|"update"|"delete", ... } ] }
 */
export async function planEventsFromText(text: string): Promise<AIEventPlan> {
  try {
    const res = await gemini.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
You generate ONLY JSON for a calendar executor.

Output EXACTLY this JSON shape (no extra keys, no prose, no markdown):
{
  "operations": [
    { "action": "create", "event": {
      "title": (optional string),
      "description": (optional string),
      "location": (optional string),
      "recurrence": (optional array of strings),
      "startAt": (string ISO 8601 datetime),
      "endAt": (string ISO 8601 datetime)
    }},
    { "action": "update", "googleId": (string), "event": {
      "title": (optional string),
      "description": (optional string),
      "location": (optional string),
      "recurrence": (optional array of strings),
      "startAt": (optional string ISO 8601 datetime),
      "endAt": (optional string ISO 8601 datetime)
    }},
    { "action": "delete", "googleId": (string) }
  ]
}

Rules:
- Output ONLY JSON (no code fences, no commentary).
- Keys MUST be exactly: action, googleId, event, title, description, location, recurrence, startAt, endAt.
- If you cannot infer a valid operation, return: { "operations": [] }.
- For relative times like "today 7–8pm", resolve to full ISO 8601 datetimes (e.g., "2025-09-03T19:00:00Z"). (The server will handle the timezone.)
- If no title is provided, you may omit it or set "title": "Untitled".
- Never include placeholders or links.

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
    // (optional) observe in server logs:
    console.log("[planEventsFromText] raw:", raw);

    // Some models still wrap JSON in fences; strip them if present.
    const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "");

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return { operations: [] };
    }

    if (!parsed || !Array.isArray(parsed.operations)) {
      return { operations: [] };
    }

    // Minimal validation: keep only sane ops
    const ops = parsed.operations.filter((op: any) => {
      if (!op?.action) return false;
      if (op.action === "create") {
        const ev = op.event;
        return (
          ev &&
          typeof ev.startAt === "string" &&
          typeof ev.endAt === "string" &&
          ev.startAt.length > 0 &&
          ev.endAt.length > 0
        );
      }
      if (op.action === "update") {
        return typeof op.googleId === "string" && op.googleId && op.event && typeof op.event === "object";
      }
      if (op.action === "delete") {
        return typeof op.googleId === "string" && op.googleId;
      }
      return false;
    });

    return { operations: ops };
  } catch (e) {
    console.error("[planEventsFromText] error:", e);
    return { operations: [] };
  }
}
