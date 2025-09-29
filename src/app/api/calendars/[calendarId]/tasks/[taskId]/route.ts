import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/app/lib/prisma";

const sessionSecret = new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function GET(
  req: Request,
  ctx: { params: Promise<{ calendarId: string; taskId: string }> }
) {
  const { taskId } = await ctx.params;
  const session = (await cookies()).get("ga_session")?.value;
  if (!session) return NextResponse.json({ error: "No session" }, { status: 401 });

  try {
    const { payload } = await jwtVerify(session, sessionSecret);
    const userId = payload.userId as string;

    const googleToken = await prisma.googleToken.findUnique({ where: { userId } });
    if (!googleToken) return NextResponse.json({ error: "No Google Token" }, { status: 401 });

    const gUrl = `https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${encodeURIComponent(
      taskId
    )}`;

    const gRes = await fetch(gUrl, {
      headers: { Authorization: `Bearer ${googleToken.accessToken}` },
    });

    const data = await gRes.json();
    return NextResponse.json(data, { status: gRes.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ calendarId: string; taskId: string }> }
) {
  const { taskId } = await ctx.params;
  const session = (await cookies()).get("ga_session")?.value;
  if (!session) return NextResponse.json({ error: "No session" }, { status: 401 });

  try {
    const { payload } = await jwtVerify(session, sessionSecret);
    const userId = payload.userId as string;

    const googleToken = await prisma.googleToken.findUnique({ where: { userId } });
    if (!googleToken) return NextResponse.json({ error: "No Google Token" }, { status: 401 });

    const gUrl = `https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${encodeURIComponent(
      taskId
    )}`;

    const gRes = await fetch(gUrl, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${googleToken.accessToken}` },
    });

    if (gRes.ok) return new Response(null, { status: 204 });
    return NextResponse.json({ error: "Task delete failed" }, { status: gRes.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
