import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/app/lib/prisma";

const sessionSecret = new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function GET(req: Request, { params }: { params: { calendarId: string } }) {

  const session = (await cookies()).get("ga_session")?.value;
  if (!session) return NextResponse.json( { error: "METHOD: Events/GET, ERROR: Could not retrieve cookie session" }, { status: 401 } );

  try {

        const { payload } = await jwtVerify(session, sessionSecret);
        const userId = payload.userId as string;

        const googleToken = await prisma.googleToken.findUnique({ where: { userId } });
        if (!googleToken) return NextResponse.json( { error: "METHOD: Events/GET, ERROR: No Google Token" }, { status: 401 } );
        
        const url = new URL(req.url);

        const scope = (url.searchParams.get("scope") || "future").toLowerCase(); 

        const start = url.searchParams.get("start"); 
        const end = url.searchParams.get("end"); 
        const pageToken = url.searchParams.get("pageToken") || undefined;
        const maxResults = url.searchParams.get("maxResults") as string; 

        if (start && end && Date.parse(end) < Date.parse(start)) { return NextResponse.json( { error: "METHOD: Events/GET, ERROR: end must be after start" }, { status: 400 } ); }

        const gUrl = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(params.calendarId)}/events`);

        gUrl.searchParams.set("singleEvents", "true"); 
        gUrl.searchParams.set("orderBy", "startTime"); 

        if (pageToken) gUrl.searchParams.set("pageToken", pageToken);

        if (maxResults && maxResults.length > 0) {
        
        gUrl.searchParams.set("maxResults", maxResults);

        }

        if (start) gUrl.searchParams.set("timeMin", new Date(start).toISOString());
        if (end) gUrl.searchParams.set("timeMax", new Date(end).toISOString());

        if (!start && !end) {

            const nowISO = new Date().toISOString();
            if (scope === "future") gUrl.searchParams.set("timeMin", nowISO);
            if (scope === "past")   gUrl.searchParams.set("timeMax", nowISO);

        }
        

        const gRes = await fetch(gUrl.toString(), {

            headers: { Authorization: `Bearer ${googleToken.accessToken}` },

        });

        if (!gRes.ok) {

            let message;

            try {

                const err = await gRes.json();
                message = err?.error?.message || gRes.statusText || "METHOD: Events/GET, ERROR: Calendar API Response Failed";

            } 
            catch {}

            return NextResponse.json({ error: message }, { status: gRes.status });

        }

        const data = await gRes.json(); 

        return NextResponse.json(data, { status: 200 });

    } 
    catch (error: any) {

        return NextResponse.json( { error: error?.message || "METHOD: Events/GET, ERROR: Internal Service Error" }, { status: 500 } );
  
    }
    
}

export async function POST( req: Request, { params }: { params: { calendarId: string } } ) {

  const session = (await cookies()).get("ga_session")?.value;
  if (!session) return NextResponse.json( { error: "METHOD: Events/POST, ERROR: Could not retrieve cookie session" }, { status: 401 } );
  
  try {
    
    const { payload } = await jwtVerify(session, sessionSecret);
    const userId = payload.userId as string;

    const googleToken = await prisma.googleToken.findUnique({ where: { userId } });
    if (!googleToken) return NextResponse.json( { error: "METHOD: Events/POST, ERROR: No Google Token" }, { status: 401 } );
    
    let body: any;
    
    try {
    
        body = await req.json();
    
    } 
    catch {
    
        return NextResponse.json( { error: "METHOD: Events/POST, ERROR: Invalid Body JSON" }, { status: 400 } );
    
    }

    const { title, description, location, start, end, timeZone } = body ?? {};
    
    if (!start || !end) {
    
        return NextResponse.json( { error: "METHOD: Events/POST, ERROR: Start & End time required" }, { status: 400 } );
    
    }

    const startMs = Date.parse(start);
    const endMs = Date.parse(end);
    
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return NextResponse.json( { error: "METHOD: Events/POST, ERROR: start/end must be valid ISO date-times" }, { status: 400 } );
    
    if (startMs >= endMs) return NextResponse.json( { error: "METHOD: Events/POST, ERROR: end must be after start" }, { status: 400 });

    const tz = (typeof timeZone === "string" && timeZone.trim()) || "UTC";
    const calendarId = params.calendarId;

    const gRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
        {
            method: "POST",
            headers: {
            Authorization: `Bearer ${googleToken.accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: (title && String(title).trim()) || "Untitled",
          description: description || undefined,
          location: location || undefined,
          start: { dateTime: new Date(startMs).toISOString(), timeZone: tz },
          end:   { dateTime: new Date(endMs).toISOString(),   timeZone: tz },
        }),
      }
    );

    if (!gRes.ok) return NextResponse.json({ error: "METHOD: Events/POST, ERROR: Calendar API Response Failed"}, { status: gRes.status }); 

    const data = await gRes.json();

    return NextResponse.json(data, { status: 201} );

  } 

  catch (error: any) {

    return NextResponse.json( { error: error?.message || "METHOD: Events/POST, ERROR: Internal Service Error" }, { status: 500 });

  }

}

export async function DELETE( req: Request, { params }: { params: { calendarId: string; eventId: string } } ) {
  
    const session = (await cookies()).get("ga_session")?.value;
    if (!session)  return NextResponse.json( { error: "METHOD: Event/DELETE, ERROR: Could not retrieve cookie session" }, { status: 401 } );

    try {

        const { payload } = await jwtVerify(session, sessionSecret);
        const userId = payload.userId as string;

        const googleToken = await prisma.googleToken.findUnique({ where: { userId } });
    
        if (!googleToken) return NextResponse.json( { error: "METHOD: Event/DELETE, ERROR: No Google Token" },{ status: 401 } );
    
        const sendUpdates = new URL(req.url).searchParams.get("sendUpdates") || "none";

        const gUrl = new URL( `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent( params.calendarId )}/events/${encodeURIComponent(params.eventId)}`);

        if (sendUpdates) gUrl.searchParams.set("sendUpdates", sendUpdates);

        console.log(`Attempting to delete event ${params.eventId} from calendar ${params.calendarId}`);
        console.log(`Google API URL: ${gUrl.toString()}`);

        const gRes = await fetch(gUrl.toString(), { method: "DELETE", headers: { Authorization: `Bearer ${googleToken.accessToken}` }, });

        console.log(`Google API response status: ${gRes.status}`);
        
        if (!gRes.ok) return NextResponse.json({ error: "METHOD: Event/DELETE, ERROR: Calendar API Response Failed" }, { status: gRes.status }); 

        return NextResponse.json({ error: "METHOD: Event/DELETE, Success" }, { status: gRes.status }); 

    } 
    catch (error: any) {
    
        return NextResponse.json( { error: error?.message || "METHOD: Event/DELETE, ERROR: Internal Service Error" }, { status: 500 } );
    
    }

}
