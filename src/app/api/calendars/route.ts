"use server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/app/lib/prisma";

const sessionSecret = new TextEncoder().encode(process.env.SESSION_SECRET!);
const defaults = {

    listIcon: "user",
    listBackgroundColor: "#698f3f"


};


export async function GET() { 

    const session = (await cookies()).get("ga_session")?.value;
    if (!session) return NextResponse.json( { error: "METHOD: Calendars/GET, ERROR: Failure retrieving cookie session" }, {status: 401} );

    try{

        const { payload } = await jwtVerify(session, sessionSecret);
        const userId = payload.userId as string;

        const googleToken = await prisma.googleToken.findUnique({ where: { userId } });
        if (!googleToken) return NextResponse.json( { error: "METHOD: Calendars/GET, ERROR: No Google Token" }, {status: 400} );

        const calendarListResponse = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {

            headers: { Authorization: `Bearer ${googleToken.accessToken}`}

        });
        if (!calendarListResponse.ok) return NextResponse.json( { error: "METHOD: Calendars/GET, ERROR: Calendar Fetch Error"}, { status: calendarListResponse.status });

        const calendarListData = await calendarListResponse.json();

        const googleCalendars = calendarListData && calendarListData.items ? calendarListData.items : [];
        const googleCalendarIds = googleCalendars.map((cal: any) => cal.id as string);

        const userCalendarPreferences = googleCalendarIds.length > 0 ? 
            await prisma.calendar.findMany({
        
                where: { ownerId: userId, googleId: { in: googleCalendarIds } },
                select: { googleId: true, name: true, description: true, color: true, icon: true, defaultVisibility: true },
      
            }) : [];

        const preferencesByGoogleId = new Map( userCalendarPreferences.map((pref) => [pref.googleId, pref] ) );

        const mergedCalendars = googleCalendars.map((googleCal: any) => {
        
            const pref = preferencesByGoogleId.get(googleCal.id);

            return {
                
                ...googleCal,
                summary: googleCal.summaryOverride ?? googleCal.summary ?? pref?.name ?? googleCal.id,
                description: pref?.description ?? googleCal.description ?? "",
                backgroundColor: pref?.color ?? googleCal.backgroundColor ?? defaults.listBackgroundColor,
                iconKey: pref?.icon ?? defaults.listIcon,
                defaultVisibility: pref?.defaultVisibility ?? "DEFAULT",
            
            };

        });
        
        console.log("METHOD: Calendars/GET, MESSAGE: Fetched data from Google Calendar API:", calendarListData);

        const timeZoneResponse = await fetch("https://www.googleapis.com/calendar/v3/users/me/settings/timezone", 

            { headers: { Authorization: `Bearer ${googleToken.accessToken}` } }

        );

        if (!timeZoneResponse.ok) return NextResponse.json( { error: "METHOD: Calendars/GET, ERROR: Time Zone Fetch Error"}, { status: timeZoneResponse.status });

        const timeZoneData = await timeZoneResponse.json().catch( () => null );

        return NextResponse.json({
        
            calendars: { ...calendarListData, items: mergedCalendars },
            items: mergedCalendars.map((g: any) => ({
                
                id: g.id,
                summary: g.summary ?? g.id,
                description: g.description,
                iconKey: g.iconKey,
                backgroundColor: g.backgroundColor,
                foregroundColor: g.foregroundColor,
                defaultVisibility: g.defaultVisibility,
                primary: g.primary ?? false,
                accessRole: g.accessRole,

            })),
            defaultTimeZone: timeZoneData?.value ?? null,

        });

    }

    catch (error: any){ 
        
        return NextResponse.json({error: `METHOD: Calendars/GET, ERROR: ${error?.message}` || "METHOD: Calendars/GET, ERROR: Internal Error"}, {status: 500})
    
    };

}

export async function POST(req: Request){

    const session = (await cookies()).get("ga_session")?.value;
    if (!session) return NextResponse.json({ error: "METHOD: Calendars/POST, ERROR: Failure retrieving cookie session"}, {status: 401});

    try{

        const { payload } = await jwtVerify(session, sessionSecret);
        const userId = payload.userId as string;

        const googleToken = await prisma.googleToken.findUnique( { where: { userId }});
        if(!googleToken) return NextResponse.json( {error: "METHOD: Calendars/POST, ERROR: No Google Token"}, { status: 401 });

        const { summary, description, timeZone } = await req.json();

        if (!summary || !timeZone) return NextResponse.json( {error: "METHOD: Calendars/POST, ERROR: Name & Time Zone required"}, { status: 400 } );
        
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
            const message = errorData?.error?.message || response.statusText || "METHOD: Calendars/POST, ERROR: Calendar API Response Failed";

            return NextResponse.json( { error: message }, { status: response.status });
        
        } 

        const data = await response.json();

        return NextResponse.json(data, {status: response.status});


    }
    catch(error: any){

        return NextResponse.json({ error: (error?.message || "METHOD: Calendars/POST, ERROR: Internal Service Error")  }, { status: 500 } );

    }

}

export async function DELETE(req: Request) {

  const session = (await cookies()).get("ga_session")?.value;
  
  if (!session) return NextResponse.json( { error: "METHOD: Calendars/DELETE, ERROR: Error reading session/User may not be logged in; please log in again by refreshing" }, { status: 401 } );

  try {

    const { payload } = await jwtVerify(session, sessionSecret);
    const userId = payload.userId as string;

    const googleToken = await prisma.googleToken.findUnique({ where: { userId } });

    if (!googleToken) return NextResponse.json( { error: "METHOD: Calendars/DELETE, ERROR: No Google Token Available" }, { status: 401 } );

    const contentType = req.headers.get("content-type")?.toLowerCase() || "";

    if (!contentType.includes("application/json")) return NextResponse.json( { error: "METHOD: Calendars/DELETE, ERROR: Content Type must be application/json" }, { status: 415 } );

    let body: any;
    
    try {
    
        body = await req.json();
    
    } 
    catch {
    
        return NextResponse.json( { error: "METHOD: Calendars/DELETE, ERROR: Invalid JSON body" }, { status: 400 } );

    }

    const calendarId = typeof body?.calendarId === "string" ? body.calendarId.trim() : "";

    if (!calendarId) return NextResponse.json( { error: "METHOD: Calendars/DELETE, ERROR: calendarId required" }, { status: 400 } );
    if (calendarId.toLowerCase() === "primary") return NextResponse.json( { error: "METHOD: Calendars/DELETE, ERROR: Primary calendar cannot be deleted" }, { status: 403 } );

    const responseMetaData = await fetch(

        `https://www.googleapis.com/calendar/v3/users/me/calendarList/${encodeURIComponent(calendarId)}`,
        { headers: { Authorization: `Bearer ${googleToken.accessToken}` } }

    );

    if (responseMetaData.status === 404) return NextResponse.json( { error: "METHOD: Calendars/DELETE, ERROR: Calendar inaccessible/does not exist" }, { status: 404 });
    
    if (!responseMetaData.ok) {

        let message = responseMetaData.statusText;
      
        try {
    
            const err = await responseMetaData.json();
    
            message = err?.error?.message ?? message;
    
        } 
        catch{ }

        return NextResponse.json( { error: `METHOD: Calendars/DELETE, ERROR: Failed to fetch calendar: ${message}` }, { status: responseMetaData.status } );

    }

    const meta = await responseMetaData.json();

    if (meta?.primary === true) return NextResponse.json( { error: "METHOD: Calendars/DELETE, ERROR: Primary calendar cannot be deleted" }, { status: 403 } );

    const isOwner = meta?.accessRole === "owner"; // unsubscribe if user is not owner

    const endpoint = isOwner ? `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}` : `https://www.googleapis.com/calendar/v3/users/me/calendarList/${encodeURIComponent(calendarId)}`;

    const deletion = await fetch(endpoint, {

      method: "DELETE",
      headers: { Authorization: `Bearer ${googleToken.accessToken}` },

    });

    if (!deletion.ok) {

        let message = deletion.statusText;

        try {

            const err = await deletion.json();
            message = err?.error?.message ?? message;
      
        } 
        catch {}
      
        return NextResponse.json( { error: `METHOD: Calendars/DELETE, ERROR: Failed to delete calendar: ${message}` }, { status: deletion.status } );

    }

        return NextResponse.json( { success: true, calendarId, mode: isOwner ? "permanent" : "unsubscribe" }, { status: 200 } );

    } 
    catch (error: any) {
  
        return NextResponse.json( { error: error?.message || "Internal Service Error" }, { status: 500 } );

    }

}
