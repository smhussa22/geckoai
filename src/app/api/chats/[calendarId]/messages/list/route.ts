import "server-only";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { authUserOrThrow } from "@/app/lib/getUser";
import { s3, s3Bucket, s3MessageKey, s3SignedGetUrl } from "@/app/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";

const fallbackMessageGet = 1000;

export async function GET(req: Request, ctx: { params: Promise<{ calendarId: string }> }) {

    try {

        const user = await authUserOrThrow();
        const { calendarId } = await ctx.params;

        const url = new URL(req.url);
        const all = url.searchParams.get("all") === "true";
        const takeParam = Number(url.searchParams.get("take") ?? 50);
        const take = all ? fallbackMessageGet : Math.min(takeParam, 100);

        const rows = await prisma.message.findMany({

            where: { calendarId },
            orderBy: { createdAt: "asc" },
            take,

        });

        const messages = [];
        for (const message of rows) {

            const key = s3MessageKey(user.id, calendarId, message.id);
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

        }

        return NextResponse.json({ messages });
    } 
    catch (error: any) {

        return NextResponse.json({ error: error?.message ?? "Internal Server Error" }, { status: 500 });
    
    }
    
}
