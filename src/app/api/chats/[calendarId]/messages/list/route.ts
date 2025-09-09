import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { authUserOrThrow } from "@/app/lib/getUser";
import { gemini } from "@/app/lib/gemini";
import {
  s3,
  s3DeletePrefix,
  s3MessagesPrefix,
  s3WriteMessageJSON,
  s3CopyObject,
  s3DeleteObject,
  s3CommittedAttachmentKey,
  s3SignedGetUrl,
  s3MessageKey,
  s3Bucket,
} from "@/app/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";

type StagedFile = {
  tempId: string;
  fileName: string;
  mimeType: string;
  size: number;
  s3Key: string;
};

export async function GET(req: Request, ctx: { params: Promise<{ calendarId: string }> }) {
  try {
    const user = await authUserOrThrow();
    const { calendarId } = await ctx.params;

    const url = new URL(req.url);
    const all = url.searchParams.get("all") === "true";
    const takeParam = Number(url.searchParams.get("take") ?? 50);
    const take = all ? 1000 : Math.min(takeParam, 100);

    console.log("=== GET MESSAGES DEBUG ===");
    console.log("Calendar ID:", calendarId);
    console.log("Take:", take);

    const rows = await prisma.message.findMany({
      where: { calendarId },
      orderBy: { createdAt: "asc" },
      take,
    });

    console.log("Found messages:", rows.length);

    const messages = [];
    for (const message of rows) {
      const key = s3MessageKey(user.id, calendarId, message.id);
      
      try {
        const object = await s3.send(new GetObjectCommand({ Bucket: s3Bucket, Key: key }));
        const json = JSON.parse(await object.Body!.transformToString("utf-8"));

        const attachments = await Promise.all(
          (json.attachments ?? []).map(async (attachment: any) => ({
            id: `${message.id}:${attachment.fileName ?? attachment.filename}`,
            name: attachment.fileName ?? attachment.filename,
            url: await s3SignedGetUrl(attachment.s3Key, 900),
            mime: attachment.mimeType,
          }))
        );

        messages.push({
          id: message.id,
          role: message.role.toLowerCase(),
          content: message.content,
          createdAt: message.createdAt.toISOString(),
          attachments,
        });
      } catch (s3Error) {
        console.error("S3 error for message", message.id, s3Error);
        // Fallback without attachments
        messages.push({
          id: message.id,
          role: message.role.toLowerCase(),
          content: message.content,
          createdAt: message.createdAt.toISOString(),
          attachments: [],
        });
      }
    }

    console.log("Returning messages:", messages.length);
    return NextResponse.json({ messages });

  } catch (error: any) {
    console.error("GET messages error:", error);
    return NextResponse.json({ error: error?.message ?? "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ calendarId: string }> }
) {
  try {
    const user = await authUserOrThrow();
    const { calendarId } = await ctx.params;

    const { text, staged } = (await req.json()) as {
      text: string;
      staged?: StagedFile[];
    };
    
    console.log("=== GEMINI REQUEST DEBUG ===");
    console.log("User ID:", user.id);
    console.log("Calendar ID:", calendarId);
    console.log("Message text:", text);
    console.log("Staged files:", staged?.length || 0);

    if (!text?.trim())
      return NextResponse.json({ error: "need text" }, { status: 400 });

    // ---- load prior turns and build Gemini history ----
    const previousMessages = await prisma.message.findMany({
      where: { calendarId },
      orderBy: { createdAt: "asc" },
    });

    console.log("Previous messages found:", previousMessages.length);

    const history: Array<{
      role: "user" | "model";
      parts: Array<{ text: string }>;
    }> = [];

    for (const message of previousMessages) {
      const key = s3MessageKey(user.id, calendarId, message.id);
      let parts: Array<{ text: string }> = [{ text: message.content }];

      try {
        const obj = await s3.send(
          new GetObjectCommand({ Bucket: s3Bucket, Key: key })
        );
        const json = JSON.parse(await obj.Body!.transformToString("utf-8"));

        if (json.attachments?.length) {
          const attachmentsText =
            "Attached files:\n" +
            json.attachments
              .map(
                (a: any) => `- ${a.fileName || a.filename} [${a.mimeType}]`
              )
              .join("\n");
          parts = [{ text: message.content }, { text: attachmentsText }];
        }
      } catch (s3Error) {
        console.error("S3 retrieval failed for message:", message.id, s3Error);
        // Continue with just the basic message content
      }

      const role = message.role.toLowerCase() === "user" ? "user" : "model";
      history.push({ role, parts });
      
      console.log(`Message ${message.id}: role=${role}, parts=${parts.length}`);
    }

    console.log("Final history length:", history.length);

    // ---- persist user's message first ----
    const userMessage = await prisma.message.create({
      data: {
        calendarId,
        role: "USER",
        content: text,
      },
    });

    console.log("User message created:", userMessage.id);

    // move staged → committed
    const committedFiles: {
      fileName: string;
      mimeType: string;
      size: number;
      s3Key: string;
    }[] = [];

    for (const stagedFile of staged ?? []) {
      const key = s3CommittedAttachmentKey(
        user.id,
        calendarId,
        userMessage.id,
        stagedFile.fileName
      );
      
      console.log("Moving staged file:", stagedFile.fileName, "to", key);
      
      await s3CopyObject(stagedFile.s3Key, key, stagedFile.mimeType);
      await s3DeleteObject(stagedFile.s3Key);

      committedFiles.push({
        fileName: stagedFile.fileName,
        mimeType: stagedFile.mimeType,
        size: stagedFile.size,
        s3Key: key,
      });
    }

    await s3WriteMessageJSON(user.id, calendarId, userMessage.id, {
      id: userMessage.id,
      role: "user",
      content: userMessage.content,
      calendarId,
      createdAt: userMessage.createdAt.toISOString(),
      attachments: committedFiles,
    });

    console.log("User message JSON written to S3");

    const attachmentsForModel = await Promise.all(
      committedFiles.map(async (c) => ({
        filename: c.fileName,
        mimeType: c.mimeType,
        url: await s3SignedGetUrl(c.s3Key, 600),
      }))
    );

    const parts: Array<{ text: string }> = [{ text }];
    if (attachmentsForModel.length) {
      const attachmentText = "Attached files (signed URLs):\n" +
        attachmentsForModel
          .map((a) => `- ${a.filename} [${a.mimeType}] ${a.url}`)
          .join("\n");
      parts.push({ text: attachmentText });
      console.log("Attachments for model:", attachmentsForModel.length);
    }

    console.log("Current message parts:", JSON.stringify(parts, null, 2));
    console.log("Starting Gemini chat...");

    const chat = gemini.startChat({ history });
    console.log("Gemini chat started successfully");

    console.log("Sending message to Gemini...");
    const result = await chat.sendMessage(parts);
    console.log("Gemini response received");
    
    const assistantText = result.response.text() || "Failed to respond";
    console.log("Assistant response length:", assistantText.length);
    console.log("Assistant response preview:", assistantText.substring(0, 200) + "...");

    const assistantMessage = await prisma.message.create({
      data: {
        calendarId,
        role: "ASSISTANT",
        content: assistantText,
      },
    });

    console.log("Assistant message created:", assistantMessage.id);

    await s3WriteMessageJSON(user.id, calendarId, assistantMessage.id, {
      id: assistantMessage.id,
      role: "assistant",
      content: assistantMessage.content,
      calendarId,
      createdAt: assistantMessage.createdAt.toISOString(),
      attachments: [],
    });

    await prisma.calendar.update({
      where: { id: calendarId },
      data: { lastMessageAt: new Date() },
    });

    console.log("=== GEMINI REQUEST SUCCESS ===");

    return NextResponse.json({
      message: assistantText,
      messageId: assistantMessage.id,
    });

  } catch (error: any) {
    console.error("=== GEMINI API ERROR (DETAILED) ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Gemini-specific error details
    if (error.response) {
      console.error("Gemini response:", error.response);
    }
    if (error.status) {
      console.error("Error status:", error.status);
    }
    if (error.details) {
      console.error("Error details:", error.details);
    }
    
    // Log the full error object
    console.error("Full error object:", JSON.stringify(error, null, 2));

    return NextResponse.json(
      { error: error.message || "An internal server error occurred." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, ctx: { params: Promise<{ calendarId: string }> }) {
  try {
    const user = await authUserOrThrow();
    const { calendarId } = await ctx.params;

    await prisma.message.deleteMany({ where: { calendarId } });
    await s3DeletePrefix(s3MessagesPrefix(user.id, calendarId));

    return NextResponse.json({ ok: true });
  } 
  catch (error: any) {
    console.error("[DELETE MESSAGES ERROR]", error); 
    return NextResponse.json(
      { error: error.message || "An internal server error occurred." },
      { status: 500 }
    );
  }
}