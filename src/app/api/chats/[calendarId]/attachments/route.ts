"use server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/app/lib/prisma";
import { randomUUID } from "crypto";
import { s3, s3Bucket } from "@/app/lib/s3";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const sessionSecret = new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function POST(
  req: Request,
  ctx: { params: Promise<{ calendarId: string }> }
) {
  const { calendarId } = await ctx.params;

  const session = (await cookies()).get("ga_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { payload } = await jwtVerify(session, sessionSecret);
  const userId = payload.userId as string;

  // Validate calendar ownership
  const cal = await prisma.calendar.findFirst({
    where: { id: calendarId, ownerId: userId },
    select: { id: true },
  });
  if (!cal) return NextResponse.json({ error: "Calendar not found" }, { status: 404 });

  // read multipart
  const form = await req.formData();
  const files = form.getAll("files") as File[];
  if (!files?.length) {
    return NextResponse.json({ error: "No files" }, { status: 400 });
  }

  const uploaded: Array<{
    id: string;
    filename: string;
    mimeType: string;
    size: number;
  }> = [];

  for (const file of files) {
    const id = randomUUID();
    const key = `users/${userId}/cal/${calendarId}/attachments/${id}/${file.name}`;

    const arrayBuf = await file.arrayBuffer();
    await s3.send(
      new PutObjectCommand({
        Bucket: s3Bucket,
        Key: key,
        Body: Buffer.from(arrayBuf),
        ContentType: file.type || "application/octet-stream",
      })
    );

    await prisma.attachment.create({
      data: {
        id,
        calendarId,
        userId,
        status: "STAGED",
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        size: BigInt(file.size),
        bucket: s3Bucket,
        s3Key: key,
      },
    });

    uploaded.push({
      id,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
    });
  }

  return NextResponse.json({ attachments: uploaded }, { status: 201 });
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ calendarId: string }> }
) {
  const { calendarId } = await ctx.params;

  const session = (await cookies()).get("ga_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { payload } = await jwtVerify(session, sessionSecret);
  const userId = payload.userId as string;

  // Validate calendar ownership
  const cal = await prisma.calendar.findFirst({
    where: { id: calendarId, ownerId: userId },
    select: { id: true },
  });
  if (!cal) return NextResponse.json({ error: "Calendar not found" }, { status: 404 });

  const url = new URL(req.url);
  const idsParam = url.searchParams.get("ids");
  if (!idsParam) return NextResponse.json({ error: "ids required" }, { status: 400 });

  const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
  if (!ids.length) return NextResponse.json({ error: "no ids" }, { status: 400 });

  const rows = await prisma.attachment.findMany({
    where: { id: { in: ids }, userId, calendarId, status: "STAGED" },
    select: { id: true, bucket: true, s3Key: true },
  });

  for (const r of rows) {
    if (r.s3Key) {
      try {
        await s3.send(new DeleteObjectCommand({ Bucket: r.bucket, Key: r.s3Key }));
      } catch {}
    }
  }

  await prisma.attachment.deleteMany({
    where: { id: { in: rows.map((r) => r.id) }, userId, calendarId, status: "STAGED" },
  });

  return NextResponse.json({ success: true, count: rows.length }, { status: 200 });
}
