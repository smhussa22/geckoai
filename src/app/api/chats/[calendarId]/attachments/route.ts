"use server";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { s3WriteObject, s3StagedAttachmentKey } from "@/app/lib/s3";
import { authUserOrThrow } from "@/app/lib/getUser";

export async function POST(req: Request, ctx: { params: Promise<{ calendarId: string }> }) {
    try {
        const user = await authUserOrThrow();
        const { calendarId } = await ctx.params;

        const form = await req.formData();
        const file = form.get("file") as File | null;
        if (!file) return NextResponse.json({ staged: [] });

        const tempId = randomUUID();
        const key = s3StagedAttachmentKey(user.id, calendarId, tempId, file.name);
        const allocatedMemory = Buffer.from(await file.arrayBuffer());

        await s3WriteObject(key, allocatedMemory, file.type || "application/octet-stream");

        return NextResponse.json({
            tempId,
            filename: file.name,
            mimeType: file.type || "appliation/octet.stream",
            size: file.size,
            s3Key: key,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
