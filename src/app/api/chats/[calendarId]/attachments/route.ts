"use server";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { s3WriteObject, s3StagedAttachmentKey } from "@/app/lib/s3";
import { authUserOrThrow } from "@/app/lib/getUser";

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

    console.log("[API] Upload success", { tempId, key });

    return NextResponse.json({
      tempId,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      s3Key: key,
    });
  } catch (error: any) {
    console.error("[API] Upload error", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
