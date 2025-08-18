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
        if (!googleToken) return NextResponse.json( { error: "No Google Token" }, {status: 400} );

        const calendarListResponse = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {

            headers: { Authorization: `Bearer ${googleToken.accessToken}`}

        });

        if (!calendarListResponse.ok) return NextResponse.json( { error: "Calendar Fetch Error"}, { status: calendarListResponse.status });

        const calendarListData = await calendarListResponse.json();
        console.log("Fetched data from Google Calendar API:", calendarListData);

        const timeZoneResponse = await fetch("https://www.googleapis.com/calendar/v3/users/me/settings/timezone", 

            { headers: { Authorization: `Bearer ${googleToken.accessToken}` } }

        );

        if (!timeZoneResponse.ok) return NextResponse.json( { error: "Time Zone Fetch Error"}, { status: timeZoneResponse.status });

        const timeZoneData = await timeZoneResponse.json().catch( () => null );

        return NextResponse.json({

            calendars: calendarListData,
            defaultTimeZone: timeZoneData?.value ?? null,

        });

    }

    catch (error: any){ return NextResponse.json({error: error?.message || "Internal Error"}, {status: 500})};

}

export async function POST(req: Request){

    const session = (await cookies()).get("ga_session")?.value;
    if (!session) return NextResponse.json({ error: "No Session"}, {status: 401});

    try{

        const { payload } = await jwtVerify(session, sessionSecret);
        const userId = payload.userId as string;

        const googleToken = await prisma.googleToken.findUnique( { where: { userId }});
        if(!googleToken) return NextResponse.json( {error: "No Google Token"}, { status: 401 });

        const { summary, description, timeZone } = await req.json();

        if (!summary || !timeZone) return NextResponse.json( {error: "Name & Time Zone required"}, { status: 400 } );
        
        const response = await fetch("https://www.googleapis.com/calendar/v3/calendars", {

            method: "POST",
            headers: {

                Authorization: `Bearer ${googleToken.accessToken}`,
                "Content-Type": "application/json",

            },
            body: JSON.stringify({

                summary,
                description,
                timeZone

            }),

        });

        if (!response.ok){

            const errorData = await response.json().catch( () => null );
            const message = errorData?.error?.message || response.statusText || "Calendar API Response Failed";

            return NextResponse.json( { error: message }, { status: response.status });
        
        } 

        const data = await response.json();

        return NextResponse.json(data, {status: response.status});


    }
    catch(error: any){

        return NextResponse.json({ error: (error?.message || "Internal Service Error")  }, { status: 500} );

    }

}