"use server";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { s3WriteObject, s3StagedAttachmentKey } from "@/app/lib/s3";
import { authUserOrThrow } from "@/app/lib/getUser";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: Request, ctx: { params: Promise<{ calendarId: string }> }) {
    
    try {
        const user = await authUserOrThrow();
        const { calendarId } = await ctx.params;

        console.log("[API] Upload start", { userId: user.id, calendarId });

        const form = await req.formData();
        const file = form.get("file") as File | null;

        if (!file) {
            console.warn("[API] No file found in formData");
            return NextResponse.json({ staged: [] });
        }

        console.log("[API] Got file", { name: file.name, size: file.size, type: file.type });

        const tempId = randomUUID();
        const key = s3StagedAttachmentKey(user.id, calendarId, tempId, file.name);

        const allocatedMemory = Buffer.from(await file.arrayBuffer());
        console.log("[API] Writing to S3", { key, size: allocatedMemory.length });
        await s3WriteObject(key, allocatedMemory, file.type || "application/octet-stream");

        console.log("[API] Upload to S3 success", { tempId, key });

        let geminiUri: string | null = null;
        let geminiMimeType: string | null = null;

        try {
            console.log("[API] Uploading to Gemini File API...");

            const blob = new Blob([allocatedMemory], {
                type: file.type || "application/octet-stream",
            });

            const uploaded = await ai.files.upload({
                file: blob,
                config: { displayName: file.name },
            });

            if (!uploaded.name) {
                console.error("[API] Uploaded file has no name property:", uploaded);
                throw new Error("Uploaded file missing name identifier");
            }

            let getFile = await ai.files.get({ name: uploaded.name });
            while (getFile.state === "PROCESSING") {
                console.log("[API] Gemini still processing, waiting 5s...");
                await new Promise((r) => setTimeout(r, 5000));

                if (!uploaded.name) {
                    console.error("[API] File name became undefined during processing");
                    throw new Error("File name identifier lost during processing");
                }

                getFile = await ai.files.get({ name: uploaded.name });
            }

            if (getFile.state === "FAILED") {
                console.error("[API] Gemini processing failed", getFile);
                throw new Error("Gemini failed to process file");
            }

            geminiUri = getFile.uri || null;
            geminiMimeType = getFile.mimeType || null;

            console.log("[API] Gemini upload success", { geminiUri, geminiMimeType });
        } catch (geminiError: any) {
            console.error("[API] Gemini File API error", geminiError);
        }

        return NextResponse.json({
            tempId,
            filename: file.name,
            mimeType: file.type || "application/octet-stream",
            size: file.size,
            s3Key: key,
            geminiUri,
            geminiMimeType,
        });
    } catch (error: any) {
        console.error("[API] Upload error", error);
        return NextResponse.json(
            { error: error?.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
