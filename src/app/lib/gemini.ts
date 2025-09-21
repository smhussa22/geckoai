import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const geminiClient = ai;

export async function gemini({
    text,
    files = [],
    systemInstruction,
}: {
    text?: string;
    files?: { mimeType: string; data?: ArrayBuffer; uri?: string }[];
    systemInstruction?: string;
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
        config: {
            systemInstruction,
            temperature: 0,
        },
    });

    return response.text;
}
