"use server";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const sessionSecret = new TextEncoder().encode(process.env.SESSION_SECRET!);

function formatBytes (bytes: number){

    if (bytes === 0) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, i);
    const fixed = value.toFixed(1);
    return `${fixed} ${sizes[i]}`;

}

export async function getUserStorage(){

    const session = (await cookies()).get("ga_session")?.value;
    if (!session) return null;

    const { payload } = await jwtVerify(session, sessionSecret);

    const userId = payload.userId as string | undefined;
    if (!userId) return NextResponse.json({error: "No user"});

    const user = await prisma.user.findUnique({

        where: { id: userId },
        select: { 

            id: true,
            email: true,
            plan: true,
            storageUsedBytes: true,
            storageLimitBytes: true,

        }

    });
    if (!user) return NextResponse.json({error: "Can't get user storage"});

    const used = Number(user.storageUsedBytes);
    const limit = Number(user.storageLimitBytes);
    const remaining = Math.max(0, limit - used);
    const percentUsed = Math.round((used/limit ) * 100);

    return {
        
        userId: user.id,
        email: user.email,
        plan: user.plan,
        bytes: {

            used,
            limit,
            remaining,

        },
        formatted: {

            used: formatBytes(used),
            limit: formatBytes(limit),
            remaining: formatBytes(remaining),
            percentUsed, 

        },
  
    };

}