import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const geminiClient = ai;

const systemInstruction = `
You are an assistant that manages calendar events and tasks for students.

Always output ONLY valid JSON that matches this schema:

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
        "interval": number,             // e.g. 1 = every week, 2 = every 2 weeks
        "byDay": ["MO","TU","WE","TH","FR","SA","SU"], // if weekly
        "until": "YYYY-MM-DD | null"    // end date if known
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
- For recurring classes/labs, include a recurrence object instead of expanding all occurrences.
- Only include events or tasks that are explicitly stated in the document or user input.
- Do not invent information. If unsure, leave the field null or omit it.
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
