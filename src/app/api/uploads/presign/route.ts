import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "@/app/lib/prisma";
import { authUser } from "@/app/lib/auth";
import crypto from "crypto";

const s3 = new S3Client({ 
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const Bucket = process.env.S3_BUCKET_NAME!;
const maxFiles = Number(process.env.MAX_FILES_PER_MESSAGE!) || 10;

type IncomingFile = { name: string; type?: string; size: number };

export async function POST(req: Request) {
  try {
    const user = await authUser();
    if (!user) {
      return NextResponse.json(
        { error: "METHOD: AWS/POST, ERROR: Unauthorized" }, 
        { status: 401 }
      );
    }

    if (!Bucket) {
      return NextResponse.json(
        { error: "METHOD: AWS/POST, ERROR: No S3 Bucket defined" }, 
        { status: 500 }
      );
    }

    const body = (await req.json()) as { files: IncomingFile[] };
    const files = body?.files || [];

    if (files.length < 1) {
      return NextResponse.json(
        { error: "METHOD: AWS/POST, ERROR: No Files given" }, 
        { status: 400 }
      );
    }

    if (files.length > maxFiles) {
      return NextResponse.json(
        { error: `METHOD: AWS/POST, ERROR: You may only upload ${maxFiles} files per message.` }, 
        { status: 400 }
      );
    }

    // Check storage limits
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { storageUsedBytes: true, storageLimitBytes: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "METHOD: AWS/POST, ERROR: User not found" }, 
        { status: 404 }
      );
    }

    const totalIncomingBytes = files.reduce((sum, f) => sum + (f.size || 0), 0);
    if (BigInt(dbUser.storageUsedBytes) + BigInt(totalIncomingBytes) > BigInt(dbUser.storageLimitBytes)) {
      return NextResponse.json(
        { error: "METHOD: AWS/POST, ERROR: Storage limit exceeded." }, 
        { status: 413 }
      );
    }

    const now = Date.now();

    const attachments = await Promise.all(

      files.map(async (file) => {

        const contentType = file.type || "application/octet-stream";
        const key = `users/${user.id}/incoming/${now}-${crypto.randomUUID()}`;
        const command = new PutObjectCommand({

          Bucket,
          Key: key,
          ContentType: contentType,

        });

        const putUrl = await getSignedUrl(s3, command, { 

          expiresIn: 60 * 15, 

        });

        const record = await prisma.attachment.create({

          data: {

            userId: user.id,
            filename: file.name,
            mimeType: contentType,
            size: BigInt(file.size || 0),
            bucket: Bucket,
            s3Key: key,

          },

        });

        return {

          id: record.id,
          putUrl,
          key,
          filename: file.name,
          type: contentType,
          size: file.size,

        };

      })

    );

    return NextResponse.json({ attachments });

  } 
  catch (error: any) {

    console.error('Presign error:', error);

    return NextResponse.json(
      { error: "METHOD: AWS/POST, ERROR: Internal Server Error" }, 
      { status: 500 }
    );

  }
  
}