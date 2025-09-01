import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/app/lib/prisma";

const sessionSecret = new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function DELETE(req: Request, { params }: { params: { calendarId: string; eventId: string } }) {

  const session = (await cookies()).get("ga_session")?.value;
  if (!session) return NextResponse.json({ error: "METHOD: Event/DELETE, ERROR: Could not retrieve cookie session" }, { status: 401 });

  try {

    const { payload } = await jwtVerify(session, sessionSecret);
    const userId = payload.userId as string;

    const googleToken = await prisma.googleToken.findUnique({ where: { userId } });
    if (!googleToken) return NextResponse.json({ error: "METHOD: Event/DELETE, ERROR: No Google Token" }, { status: 401 });

    const calendar = await prisma.calendar.findFirst({

      where: { id: params.calendarId, ownerId: userId },
      select: { googleId: true },

    });
    if (!calendar) return NextResponse.json({ error: "Calendar not found" }, { status: 404 });

    const sendUpdates = new URL(req.url).searchParams.get("sendUpdates") || "none";
    const gUrl = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar.googleId)}/events/${encodeURIComponent(params.eventId)}`);

    if (sendUpdates) gUrl.searchParams.set("sendUpdates", sendUpdates);

    const gRes = await fetch(gUrl.toString(), {

      method: "DELETE",
      headers: { Authorization: `Bearer ${googleToken.accessToken}` },

    });
    if (!gRes.ok) return NextResponse.json({ error: "METHOD: Event/DELETE, ERROR: Calendar API Response Failed" }, { status: gRes.status });

    await prisma.event.delete({

      where: {
        calendarId_googleId: {
          calendarId: params.calendarId,
          googleId: params.eventId,
        },
      },

    }).catch(async () => {

      await prisma.event.deleteMany({
        where: { calendarId: params.calendarId, googleId: params.eventId },

      });
      
    });

    return new Response(null, { status: 204 });

  } 
  catch (error: any) {

    return NextResponse.json({ error: error?.message || "METHOD: Event/DELETE, ERROR: Internal Service Error" }, { status: 500 });

  }

}

export async function GET(req: Request, { params }: { params: { calendarId: string; eventId: string } }) {

  const session = (await cookies()).get("ga_session")?.value;
  if (!session) return NextResponse.json({ error: "METHOD: Event/GET, ERROR: Could not retrieve cookie session" }, { status: 401 });

  try {

    const { payload } = await jwtVerify(session, sessionSecret);
    const userId = payload.userId as string;

    const googleToken = await prisma.googleToken.findUnique({ where: { userId } });
    if (!googleToken) return NextResponse.json({ error: "METHOD: Event/GET, ERROR: No Google Token" }, { status: 401 });

    const calendar = await prisma.calendar.findFirst({

      where: { id: params.calendarId, ownerId: userId },
      select: { googleId: true },

    });
    if (!calendar) return NextResponse.json({ error: "Calendar not found" }, { status: 404 });

    const gUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar.googleId)}/events/${encodeURIComponent(params.eventId)}`;

    const gRes = await fetch(gUrl, { headers: { Authorization: `Bearer ${googleToken.accessToken}` } });
    if (!gRes.ok) return NextResponse.json({ error: "METHOD: Event/GET, ERROR: Calendar API Response Failed" }, { status: gRes.status });

    const data = await gRes.json();

    const startIso = data.start?.dateTime ? new Date(data.start.dateTime) :data.start?.date ? new Date(`${data.start.date}T00:00:00.000Z`) : null;
    const endIso = data.end?.dateTime ? new Date(data.end.dateTime) : data.end?.date ? new Date(`${data.end.date}T00:00:00.000Z`) : null;

    if (startIso && endIso) {

      await prisma.event.upsert({
        where: {
          calendarId_googleId: {
            calendarId: params.calendarId,
            googleId: params.eventId,
          },
        },
        update: {
          name: data.summary ?? "",
          description: data.description ?? null,
          start: startIso,
          end: endIso,
        },
        create: {
          calendarId: params.calendarId,
          googleId: params.eventId,
          name: data.summary ?? "",
          description: data.description ?? null,
          start: startIso,
          end: endIso,
        },

      });

    }

    return NextResponse.json(data, { status: 200 });

  } 
  catch (error: any) {

    return NextResponse.json({ error: error?.message || "METHOD: Event/GET, ERROR: Internal Service Error" }, { status: 500 });

  }

}
