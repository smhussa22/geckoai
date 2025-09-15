import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
}

const modelName = process.env.GEMINI_MODEL ?? "gemini-2.0-flash-exp";

export const genAI = new GoogleGenerativeAI(apiKey);
export const gemini = genAI.getGenerativeModel({ model: modelName });

/**
 * Runs Gemini on text with a given system prompt.
 * @param text - The text to analyze (user content + extracted file text).
 * @param systemPrompt - Instructions to guide Gemini (built in route.ts).
 */

export async function extractEventsFromText(text: string, systemPrompt: string) {
    try {
        const result = await gemini.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt + "\n\n" + text }],
                },
            ],
        });

        return result.response.text();
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
}
