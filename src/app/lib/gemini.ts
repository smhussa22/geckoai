import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const geminiClient = ai;

const systemInstruction = `
You are an assistant that manages calendar events and tasks for students.

Always output ONLY valid JSON that matches this schema. Respond strictly with valid JSON only. No code fences or explanations.:

{
  "events": [
    {
      "title": "string",
      "date": "YYYY-MM-DD",             // first occurrence if recurring
      "time": "HH:mm (24h, optional, null if not applicable)",
      "end_time": "HH:mm (24h, optional, null if not applicable)",
      "location": "string (optional)",
      "notes": "string (optional)",
      "recurrence": {
        "frequency": "DAILY | WEEKLY | MONTHLY | NONE",
        "interval": number,
        "byDay": ["MO","TU","WE","TH","FR","SA","SU"], // REQUIRED for WEEKLY frequency, must match the weekday of the date field
        "until": "YYYY-MM-DD | null"                   // must never be null if recurrence has a defined end
      }
    }
  ],
  "tasks": [
    {
      "title": "string",
      "due_date": "YYYY-MM-DD",
      "time": "HH:mm (optional, null if not applicable)",
      "notes": "string (optional)"
    }
  ]
}

Rules:
- Use ISO dates.
- Use 24-hour times only if explicitly given (otherwise null).
- Events = only lectures, labs, seminars, or one-time exams with a clear scheduled time.
- Tasks = assignments, quizzes, readings, SmartBook activities, discussions, application-based activities, and any other due dates.
- Do NOT create events for tasks. Never convert tasks into events.
- If the course is asynchronous with no scheduled classes, output no events at all.
- For recurring classes/labs, use recurrence instead of expanding all occurrences.
- CRITICAL: For WEEKLY recurrence, always infer the weekday of the event date and set recurrence.byDay accordingly. Example: if date = 2025-10-01 (a Wednesday), then byDay = ["WE"]. This is REQUIRED for weekly events.
- If user requests "repeat N times" or gives an end date, calculate recurrence.until as the final occurrence date. Never leave until null in that case.
- If no recurrence is mentioned, set frequency = "NONE" and byDay = [].
- Do not invent information. If unsure, leave optional fields null.
- Return valid JSON only, with no extra text.
`;

export async function gemini({
    text,
    files = [],
}: {
    text?: string;
    files?: { mimeType: string; data?: ArrayBuffer }[];
}) {
    const parts: any[] = [];
    if (text) parts.push({ text });

    for (const file of files) {
        if (file.data) {
            parts.push({
                inlineData: {
                    mimeType: file.mimeType,
                    data: Buffer.from(file.data).toString("base64"),
                },
            });
        }
    }

    console.log("[gemini.ts] Final parts for request:", parts);

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts }],
        config: { systemInstruction, temperature: 0 },
    });

    return response.text;
}
