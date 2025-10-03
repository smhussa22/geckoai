import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/app/lib/prisma";

const sessionSecret = new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function GET(req: Request, ctx: { params: Promise<{ calendarId: string }> }) {
    const { calendarId } = await ctx.params;
    const session = (await cookies()).get("ga_session")?.value;
    if (!session) return NextResponse.json({ error: "No session" }, { status: 401 });

    try {
        const { payload } = await jwtVerify(session, sessionSecret);
        const userId = payload.userId as string;
        const googleToken = await prisma.googleToken.findUnique({ where: { userId } });
        if (!googleToken) return NextResponse.json({ error: "No Google Token" }, { status: 401 });

        const gUrl = new URL("https://tasks.googleapis.com/tasks/v1/lists/@default/tasks");
        const gRes = await fetch(gUrl.toString(), {
            headers: { Authorization: `Bearer ${googleToken.accessToken}` },
        });

        if (!gRes.ok) {
            return NextResponse.json({ error: "Google Tasks API failed" }, { status: gRes.status });
        }

        const data = await gRes.json();

        if (Array.isArray(data.items)) {
            for (const t of data.items) {
                await prisma.task.upsert({
                    where: { calendarId_googleId: { calendarId, googleId: t.id } },
                    update: {
                        title: t.title ?? "",
                        description: t.notes ?? null,
                        due: t.due ? new Date(t.due) : null,
                    },
                    create: {
                        calendarId,
                        googleId: t.id,
                        title: t.title ?? "",
                        description: t.notes ?? null,
                        due: t.due ? new Date(t.due) : null,
                    },
                });
            }
        }

        return NextResponse.json(data, { status: 200 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request, ctx: { params: Promise<{ calendarId: string }> }) {
    const { calendarId } = await ctx.params;
    const session = (await cookies()).get("ga_session")?.value;
    if (!session) return NextResponse.json({ error: "No session" }, { status: 401 });

    try {
        const { payload } = await jwtVerify(session, sessionSecret);
        const userId = payload.userId as string;
        const googleToken = await prisma.googleToken.findUnique({ where: { userId } });
        if (!googleToken) return NextResponse.json({ error: "No Google Token" }, { status: 401 });

        let body: any;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const { title, notes, due } = body ?? {};
        if (!title) return NextResponse.json({ error: "Task title required" }, { status: 400 });

        const gRes = await fetch("https://tasks.googleapis.com/tasks/v1/lists/@default/tasks", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${googleToken.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title,
                notes: notes || undefined,
                due: due ? new Date(due).toISOString() : undefined,
            }),
        });

        if (!gRes.ok) {
            return NextResponse.json({ error: "Google Tasks API failed" }, { status: gRes.status });
        }

        const data = await gRes.json();

        await prisma.task.upsert({
            where: { calendarId_googleId: { calendarId, googleId: data.id } },
            update: {
                title: data.title ?? "",
                description: data.notes ?? null,
                due: data.due ? new Date(data.due) : null,
            },
            create: {
                calendarId,
                googleId: data.id,
                title: data.title ?? "",
                description: data.notes ?? null,
                due: data.due ? new Date(data.due) : null,
            },
        });

        return NextResponse.json(data, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
