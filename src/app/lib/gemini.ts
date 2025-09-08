// app/lib/gemini.ts
import { GoogleGenAI } from "@google/genai";

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
export const model = "gemini-2.5-pro";
