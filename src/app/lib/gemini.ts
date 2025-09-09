import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
const modelName = process.env.GEMINI_MODEL ?? "gemini-2.5-pro";

export const genAI = new GoogleGenerativeAI(apiKey);
export const gemini = genAI.getGenerativeModel({ model: modelName });
