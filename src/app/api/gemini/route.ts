"use server";
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const geminiApiKey = process.env.GEMINI_API_KEY!;
const geminiModel = "gemini-2.5-flash";
const ai = new GoogleGenAI({apiKey: geminiApiKey});

export async function POST(req: Request) {

    try{

        const { userPrompt } = await req.json();
        const response = await ai.models.generateContent({

            model: geminiModel,
            contents: userPrompt ?? "",

        });

        return NextResponse.json(

            { text: response.text },
            { status: 200 },

        );

    }
    catch (error: any){

        return NextResponse.json(

            { error: error?.message ?? "Method: Gemini/POST, Error: Failed to generate." },
            { status: 200 },

        );

    }



}