import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/app/lib/prisma";

const sessionSecret = new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function GET(req: Request, ctx: { params: Promise<{ calendarId: string }> }) {
    const { calendarId } = await ctx.params;

    const session = (await cookies()).get("ga_session")?.value;
    if (!session)
        return NextResponse.json(
            { error: "METHOD: Events/GET, ERROR: Could not retrieve cookie session" },
            { status: 401 }
        );

    try {
        const { payload } = await jwtVerify(session, sessionSecret);
        const userId = payload.userId as string;

        const googleToken = await prisma.googleToken.findUnique({ where: { userId } });
        if (!googleToken)
            return NextResponse.json(
                { error: "METHOD: Events/GET, ERROR: No Google Token" },
                { status: 401 }
            );

        const calendar = await prisma.calendar.findFirst({
            where: { id: calendarId, ownerId: userId },
            select: { googleId: true },
        });
        if (!calendar) return NextResponse.json({ error: "Calendar not found" }, { status: 404 });

        const url = new URL(req.url);
        const scope = (url.searchParams.get("scope") || "future").toLowerCase();
        const start = url.searchParams.get("start");
        const end = url.searchParams.get("end");
        const pageToken = url.searchParams.get("pageToken") || undefined;
        const maxResults = url.searchParams.get("maxResults") as string;

        if (start && end && Date.parse(end) < Date.parse(start))
            return NextResponse.json(
                { error: "METHOD: Events/GET, ERROR: end must be after start" },
                { status: 400 }
            );

        const gUrl = new URL(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar.googleId)}/events`
        );
        gUrl.searchParams.set("singleEvents", "true");
        gUrl.searchParams.set("orderBy", "startTime");
        if (pageToken) gUrl.searchParams.set("pageToken", pageToken);
        if (maxResults && maxResults.length > 0) gUrl.searchParams.set("maxResults", maxResults);
        if (start) gUrl.searchParams.set("timeMin", new Date(start).toISOString());
        if (end) gUrl.searchParams.set("timeMax", new Date(end).toISOString());
        if (!start && !end) {
            const nowISO = new Date().toISOString();
            if (scope === "future") gUrl.searchParams.set("timeMin", nowISO);
            if (scope === "past") gUrl.searchParams.set("timeMax", nowISO);
        }

        const gRes = await fetch(gUrl.toString(), {
            headers: { Authorization: `Bearer ${googleToken.accessToken}` },
        });

        if (!gRes.ok)
            return NextResponse.json(
                { error: "METHOD: Events/GET, ERROR: Calendar API Response Failed" },
                { status: gRes.status }
            );

        const data = await gRes.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || "METHOD: Events/GET, ERROR: Internal Service Error" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request, ctx: { params: Promise<{ calendarId: string }> }) {
    const { calendarId } = await ctx.params;

    const session = (await cookies()).get("ga_session")?.value;
    if (!session)
        return NextResponse.json(
            { error: "METHOD: Events/POST, ERROR: Could not retrieve cookie session" },
            { status: 401 }
        );

    try {
        const { payload } = await jwtVerify(session, sessionSecret);
        const userId = payload.userId as string;

        const googleToken = await prisma.googleToken.findUnique({ where: { userId } });
        if (!googleToken)
            return NextResponse.json(
                { error: "METHOD: Events/POST, ERROR: No Google Token" },
                { status: 401 }
            );

        let body: any;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { error: "METHOD: Events/POST, ERROR: Invalid Body JSON" },
                { status: 400 }
            );
        }

        const { title, description, location, start, end, timeZone } = body ?? {};
        if (!start || !end)
            return NextResponse.json(
                { error: "METHOD: Events/POST, ERROR: Start & End time required" },
                { status: 400 }
            );

        const startMs = Date.parse(start);
        const endMs = Date.parse(end);
        if (!Number.isFinite(startMs) || !Number.isFinite(endMs))
            return NextResponse.json(
                { error: "METHOD: Events/POST, ERROR: start/end must be valid ISO date-times" },
                { status: 400 }
            );
        if (startMs >= endMs)
            return NextResponse.json(
                { error: "METHOD: Events/POST, ERROR: end must be after start" },
                { status: 400 }
            );

        const calendar = await prisma.calendar.findFirst({
            where: { id: calendarId, ownerId: userId },
            select: { googleId: true },
        });
        if (!calendar) return NextResponse.json({ error: "Calendar not found" }, { status: 404 });

        const tz = (typeof timeZone === "string" && timeZone.trim()) || "UTC";

        const gRes = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar.googleId)}/events`,

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
                    end: { dateTime: new Date(endMs).toISOString(), timeZone: tz },
                }),
            }
        );

        if (!gRes.ok)
            return NextResponse.json(
                { error: "METHOD: Events/POST, ERROR: Calendar API Response Failed" },
                { status: gRes.status }
            );

        const data = await gRes.json();

        await prisma.event.upsert({
            where: {
                calendarId_googleId: {
                    calendarId: calendarId,
                    googleId: data.id,
                },
            },
            update: {
                name: data.summary ?? "Untitled",
                description: data.description ?? null,
                start: data.start?.dateTime
                    ? new Date(data.start.dateTime)
                    : new Date(`${data.start.date}T00:00:00.000Z`),
                end: data.end?.dateTime
                    ? new Date(data.end.dateTime)
                    : new Date(`${data.end.date}T00:00:00.000Z`),
            },
            create: {
                calendarId: calendarId,
                googleId: data.id,
                name: data.summary ?? "Untitled",
                description: data.description ?? null,
                start: data.start?.dateTime
                    ? new Date(data.start.dateTime)
                    : new Date(`${data.start.date}T00:00:00.000Z`),
                end: data.end?.dateTime
                    ? new Date(data.end.dateTime)
                    : new Date(`${data.end.date}T00:00:00.000Z`),
            },
        });

        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || "METHOD: Events/POST, ERROR: Internal Service Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    ctx: { params: Promise<{ calendarId: string; eventId: string }> }
) {
    const { calendarId, eventId } = await ctx.params;

    const session = (await cookies()).get("ga_session")?.value;
    if (!session)
        return NextResponse.json(
            { error: "METHOD: Event/DELETE, ERROR: Could not retrieve cookie session" },
            { status: 401 }
        );

    try {
        const { payload } = await jwtVerify(session, sessionSecret);
        const userId = payload.userId as string;

        const googleToken = await prisma.googleToken.findUnique({ where: { userId } });
        if (!googleToken)
            return NextResponse.json(
                { error: "METHOD: Event/DELETE, ERROR: No Google Token" },
                { status: 401 }
            );

        const calendar = await prisma.calendar.findFirst({
            where: { id: calendarId, ownerId: userId },
            select: { googleId: true },
        });
        if (!calendar) return NextResponse.json({ error: "Calendar not found" }, { status: 404 });

        const sendUpdates = new URL(req.url).searchParams.get("sendUpdates") || "none";
        const gUrl = new URL(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar.googleId)}/events/${encodeURIComponent(eventId)}`
        );
        if (sendUpdates) gUrl.searchParams.set("sendUpdates", sendUpdates);

        const gRes = await fetch(gUrl.toString(), {
            method: "DELETE",
            headers: { Authorization: `Bearer ${googleToken.accessToken}` },
        });
        if (!gRes.ok)
            return NextResponse.json(
                { error: "METHOD: Event/DELETE, ERROR: Calendar API Response Failed" },
                { status: gRes.status }
            );

        await prisma.event.delete({
            where: {
                calendarId_googleId: {
                    calendarId: calendarId,
                    googleId: eventId,
                },
            },
        });

        return new Response(null, { status: 204 });
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || "METHOD: Event/DELETE, ERROR: Internal Service Error" },
            { status: 500 }
        );
    }
}
