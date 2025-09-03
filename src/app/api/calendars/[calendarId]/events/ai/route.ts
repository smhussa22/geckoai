"use server";
import { NextResponse} from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/app/lib/prisma";
import { planEventsFromText } from "@/app/lib/geminiEvents";
import type { AIEventResult, AIEventPlan} from "@/app/lib/chatTypes";

const sessionSecret = new TextEncoder().encode(process.env.SESSION_SECRET!);

const isoOrNull = (s?: string) => {

    const ms = typeof s === "string" ? Date.parse(s) : NaN;
    return Number.isFinite(ms) ? new Date(ms).toISOString() : null;

}

const validRange = (startAt?: string, endAt?: string) => {

    const start = Date.parse(startAt ?? "");
    const end = Date.parse(endAt ?? "");
    return Number.isFinite(start) && Number.isFinite(end) && start < end;

}

export async function POST(req: Request, ctx: { params: Promise<{ calendarId: string }> }) {

    const { calendarId } = await ctx.params;

    const session = (await cookies()).get("ga_session")?.value;
    if (!session) return NextResponse.json({ error: "METHOD: EventsAI/POST, Error: Unauthorized" }, { status: 401 });
  
    try {

        const { payload } = await jwtVerify(session, sessionSecret);
        const userId = payload.userId as string;

        const token = await prisma.googleToken.findUnique({ where: { userId } });
        if (!token) return NextResponse.json({ error: "METHOD: EventsAI/POST, Error: No Google Token" }, { status: 401 });
        
        const calendar = await prisma.calendar.findFirst({

            where: { id: calendarId, ownerId: userId },
            select: { googleId: true },

        });
        if (!calendar) return NextResponse.json({ error: "METHOD: EventsAI/POST, Error: Calendar not found" }, { status: 404 });
        
        let body: { text?: string; timeZone?: string } | null = null;

        try {

        body = (await req.json()) as { text?: string; timeZone?: string } | null;

        } 
        catch {}
        if (!body?.text) return NextResponse.json({ error: "METHOD: EventsAI/POST, Error: No source text" }, { status: 400 });
        
        let timezone = (body.timeZone && body.timeZone.trim()) || "";

        if (!timezone) {

            const tzRes = await fetch( "https://www.googleapis.com/calendar/v3/users/me/settings/timezone", { 

                headers: { 

                    Authorization: `Bearer ${token.accessToken}` 
                    
                },
                
            });

            if (tzRes.ok) {

                const tzData = await tzRes.json().catch(() => null);
                timezone = tzData?.value || "UTC";

            } else {

                timezone = "UTC";

            }

        }

        const plan: AIEventPlan = await planEventsFromText(body.text);

        const fetchUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar.googleId)}/events`;
        const headers = {

            Authorization: `Bearer ${token.accessToken}`,
            "Content-Type": "application/json",

        };

        const result: AIEventResult = { created: [], updated: [], deleted: [], errors: [] };

        for (const operation of plan.operations ?? []) {

            try {

                if (operation.action === "create") {

                    const event = operation.event;
                    if (!validRange(event.startAt, event.endAt)) throw new Error("Invalid startAt/endAt");

                    const response = await fetch(fetchUrl, {

                        method: "POST",
                        headers,
                        body: JSON.stringify({

                            summary: (event.title ?? "Untitled").trim(),
                            description: event.description || undefined,
                            location: event.location || undefined,
                            start: { dateTime: isoOrNull(event.startAt), timeZone: timezone },
                            end: { dateTime: isoOrNull(event.endAt), timeZone: timezone },
                            recurrence: event.recurrence,

                        }),

                    });

                    if (!response.ok) throw new Error(`create failed: ${response.status} ${response.statusText}`);
                    const data = await response.json();

                    const startIso = data.start?.dateTime ? new Date(data.start.dateTime) : data.start?.date ? new Date(`${data.start.date}T00:00:00.000Z`) : null;
                    const endIso = data.end?.dateTime ? new Date(data.end.dateTime) : data.end?.date ? new Date(`${data.end.date}T00:00:00.000Z`) : null;

                    if (startIso && endIso) {
            
                        await prisma.event.upsert({

                            where: { calendarId_googleId: { calendarId: calendarId, googleId: data.id } },
                            update: {

                                name: data.summary ?? "Untitled",
                                description: data.description ?? null,
                                start: startIso,
                                end: endIso,

                            },
                            create: {

                                calendarId: calendarId,
                                googleId: data.id,
                                name: data.summary ?? "Untitled",
                                description: data.description ?? null,
                                start: startIso,
                                end: endIso,

                            },

                        });
                    }

                    result.created.push({ googleId: data.id, htmlLink: data.htmlLink });

                }

                if (operation.action === "update") {

                    const patch: any = {};

                    if (operation.event.title !== undefined) patch.summary = (operation.event.title ?? "").trim();
                    if (operation.event.description !== undefined) patch.description = operation.event.description ?? undefined;
                    if (operation.event.location !== undefined) patch.location = operation.event.location ?? undefined;
                    if (operation.event.recurrence !== undefined) patch.recurrence = operation.event.recurrence ?? undefined;

                    if (operation.event.startAt) {

                        const iso = isoOrNull(operation.event.startAt);
                        if (!iso) throw new Error("Invalid startAt");
                        patch.start = { dateTime: iso, timeZone: timezone };

                    }
                    if (operation.event.endAt) {

                        const iso = isoOrNull(operation.event.endAt);
                        if (!iso) throw new Error("Invalid endAt");
                        patch.end = { dateTime: iso, timeZone: timezone };

                    }
                    if (patch.start && patch.end && !validRange(operation.event.startAt, operation.event.endAt)) {

                        throw new Error("Invalid startAt/endAt times");

                    }

                    const response = await fetch(`${fetchUrl}/${encodeURIComponent(operation.googleId)}`, {

                        method: "PATCH",
                        headers,
                        body: JSON.stringify(patch),

                    });
                    if (!response.ok) throw new Error(`update failed: ${response.status} ${response.statusText}`);
                    
                    const data = await response.json();

                    const startIso = data.start?.dateTime ? new Date(data.start.dateTime) : data.start?.date ? new Date(`${data.start.date}T00:00:00.000Z`) : null;
                    const endIso = data.end?.dateTime ? new Date(data.end.dateTime) : data.end?.date ? new Date(`${data.end.date}T00:00:00.000Z`) : null;

                    if (startIso && endIso) {

                        await prisma.event.upsert({

                            where: { calendarId_googleId: { calendarId: calendarId, googleId: operation.googleId } },
                            update: {
                                name: data.summary ?? "",
                                description: data.description ?? null,
                                start: startIso,
                                end: endIso,
                            },
                            create: {
                                calendarId: calendarId,
                                googleId: operation.googleId,
                                name: data.summary ?? "",
                                description: data.description ?? null,
                                start: startIso,
                                end: endIso,
                            },

                        });

                    }

                    result.updated.push({ googleId: operation.googleId, htmlLink: data.htmlLink });

                }

                if (operation.action === "delete") {

                    const response = await fetch(`${fetchUrl}/${encodeURIComponent(operation.googleId)}`, {

                        method: "DELETE",
                        headers: { Authorization: headers.Authorization },

                    });
                    if (!response.ok) throw new Error(`delete failed: ${response.status} ${response.statusText}`);

                    await prisma.event.deleteMany({

                        where: { calendarId: calendarId, googleId: operation.googleId },

                    });

                    result.deleted.push({ googleId: operation.googleId });

                }

            } 
            catch (error: any) {

                result.errors.push({

                    action: (operation as any)?.action ?? "unknown",
                    googleId: (operation as any)?.googleId,
                    message: error?.message ?? String(error),

                });

            }
        }

        return NextResponse.json({ plan, result }, { status: 200 });

    }  
    catch (error: any) {

        return NextResponse.json( { error: `METHOD: EventsAI/POST, Error: ${error?.message ?? String(error)}` }, { status: 500 } );
  
    }

}