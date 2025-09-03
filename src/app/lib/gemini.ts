import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
const geminiModel = "gemini-2.5-flash";
export const genAI = new GoogleGenerativeAI(apiKey);
export const gemini = genAI.getGenerativeModel({ model: geminiModel });