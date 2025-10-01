import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/app/lib/prisma";

const sessionSecret = new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function GET(
  req: Request,
  ctx: { params: Promise<{ calendarId: string; taskId: string }> }
) {
  const { calendarId, taskId } = await ctx.params;
  const session = (await cookies()).get("ga_session")?.value;
  if (!session) return NextResponse.json({ error: "No session" }, { status: 401 });

  try {
    const { payload } = await jwtVerify(session, sessionSecret);
    const userId = payload.userId as string;
    const googleToken = await prisma.googleToken.findUnique({ where: { userId } });
    if (!googleToken) return NextResponse.json({ error: "No Google Token" }, { status: 401 });

    const gRes = await fetch(
      `https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${encodeURIComponent(taskId)}`,
      { headers: { Authorization: `Bearer ${googleToken.accessToken}` } }
    );

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

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ calendarId: string; taskId: string }> }
) {
  const { calendarId, taskId } = await ctx.params;
  const session = (await cookies()).get("ga_session")?.value;
  if (!session) return NextResponse.json({ error: "No session" }, { status: 401 });

  try {
    const { payload } = await jwtVerify(session, sessionSecret);
    const userId = payload.userId as string;
    const googleToken = await prisma.googleToken.findUnique({ where: { userId } });
    if (!googleToken) return NextResponse.json({ error: "No Google Token" }, { status: 401 });

    const body = await req.json();

    const gRes = await fetch(
      `https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${encodeURIComponent(taskId)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${googleToken.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!gRes.ok) {
      return NextResponse.json({ error: "Google Tasks API failed" }, { status: gRes.status });
    }

    const data = await gRes.json();

    await prisma.task.update({
      where: { calendarId_googleId: { calendarId, googleId: taskId } },
      data: {
        title: data.title ?? "",
        description: data.notes ?? null,
        due: data.due ? new Date(data.due) : null,
      },
    });

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ calendarId: string; taskId: string }> }
) {
  const { calendarId, taskId } = await ctx.params;
  const session = (await cookies()).get("ga_session")?.value;
  if (!session) return NextResponse.json({ error: "No session" }, { status: 401 });

  try {
    const { payload } = await jwtVerify(session, sessionSecret);
    const userId = payload.userId as string;
    const googleToken = await prisma.googleToken.findUnique({ where: { userId } });
    if (!googleToken) return NextResponse.json({ error: "No Google Token" }, { status: 401 });

    const gRes = await fetch(
      `https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${encodeURIComponent(taskId)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${googleToken.accessToken}` },
      }
    );

    if (!gRes.ok) {
      return NextResponse.json({ error: "Google Tasks API failed" }, { status: gRes.status });
    }

    await prisma.task.deleteMany({
      where: { calendarId, googleId: taskId },
    });

    return new Response(null, { status: 204 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
