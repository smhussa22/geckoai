"use server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";

const sessionSecret = new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function GET(req: Request){

    const token = (await cookies()).get("ga_session")?.value;

    if (!token) return NextResponse.json(null, { status: 401 } );

    try{

        const { payload } = await jwtVerify(token, sessionSecret);
        const userId = (payload as any).userId;

        const user = await prisma.user.findUnique({

            where: {id: userId},
            select: { email: true, name: true, firstName: true, picture: true}

        });

        if (!user) return NextResponse.json(null, { status: 401 } );

        return NextResponse.json(user);

    }
    catch{

        return NextResponse.json(null, { status: 401 });

    }

}