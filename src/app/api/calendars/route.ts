"use server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/app/lib/prisma";

const sessionSecret = new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function GET() { 

    const session = (await cookies()).get("ga_session")?.value;
    if (!session) return NextResponse.json( { error: "No session" }, {status: 401} );

    try{

        const { payload } = await jwtVerify(session, sessionSecret);
        const userId = payload.userId as string;

        const googleToken = await prisma.googleToken.findUnique({ where: { userId } });
        if (!googleToken) return NextResponse.json( { error: "No Google Token" }, {status: 400} )

        const response = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {

            headers: { Authorization: `Bearer ${googleToken.accessToken}`}

        });

        if (!response.ok) return NextResponse.json( { error: "Calendar Fetch Error"}, { status: response.status });

        const fetchedData = await response.json();
        console.log("Fetched data from Google Calendar API:", fetchedData);
        return NextResponse.json(fetchedData);

    }

    catch (error: any){ return NextResponse.json({error: error}, {status: 401});}

}