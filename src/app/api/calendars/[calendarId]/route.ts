import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getUser } from "@/app/lib/getUser";

const defaults = {

  listIcon: "user",
  listBackgroundColor: "#698f3f",
  calendarDefaultVisibility: "DEFAULT",

};

const getAccessRole = async (accessToken: string, googleId: string) => {

  const res = await fetch(

    `https://www.googleapis.com/calendar/v3/users/me/calendarList/${encodeURIComponent(googleId)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }

  );
  if (!res.ok) return null;

  const data = await res.json();

  return data?.accessRole as "owner" | "writer" | "reader" | "freeBusyReader" | null;

};

export async function GET(req: Request, ctx: { params: Promise<{ calendarId: string }> }) {
  const { calendarId } = await ctx.params;

  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = await prisma.googleToken.findUnique({ where: { userId: user.id } });
  if (!token) return NextResponse.json({ error: "No Google token" }, { status: 400 });

  const calendar = await prisma.calendar.findFirst({

    where: { id: calendarId, ownerId: user.id },
    select: {
      id: true,
      googleId: true,
      name: true,
      description: true,
      icon: true,
      color: true,
      defaultVisibility: true,
    },

  });

  if (!calendar) return NextResponse.json({ error: "Calendar not found" }, { status: 404 });

  const gRes = await fetch(

    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar.googleId)}`,
    { headers: { Authorization: `Bearer ${token.accessToken}` } }

  );
  if (!gRes.ok) return NextResponse.json({ error: "Calendar not found on Google" }, { status: gRes.status });
  const google = await gRes.json();

  return NextResponse.json({

    id: calendar.id,
    googleId: calendar.googleId,
    name: google.summary ?? calendar.name ?? calendar.googleId,
    description: google.description ?? calendar.description ?? "",
    icon: calendar.icon ?? defaults.listIcon,
    color: calendar.color ?? defaults.listBackgroundColor,
    defaultVisibility: calendar.defaultVisibility ?? defaults.calendarDefaultVisibility,

  });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ calendarId: string }> }) {
  const { calendarId } = await ctx.params;

  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = await prisma.googleToken.findUnique({ where: { userId: user.id } });
  if (!token) return NextResponse.json({ error: "No Google token" }, { status: 400 });

  let body: any;
  try {

    body = await req.json();

  } 
  catch {

    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  }

  const calendar = await prisma.calendar.findFirst({

    where: { id: calendarId, ownerId: user.id },
    select: { googleId: true },

  });
  if (!calendar) return NextResponse.json({ error: "Calendar not found" }, { status: 404 });

  const googleId = calendar.googleId;
  const role = await getAccessRole(token.accessToken, googleId);

  if (role === "owner") {

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(googleId)}`,

      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: body.name?.trim(),
          description: body.description ?? "",
        }),
      }

    );
    if (!response.ok) return NextResponse.json({ error: response.statusText }, { status: response.status });

  } 
  else {

    const response = await fetch(`https://www.googleapis.com/calendar/v3/users/me/calendarList/${encodeURIComponent(googleId)}`,

      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summaryOverride: body.name?.trim(),
        }),
      }

    );
    if (!response.ok) return NextResponse.json({ error: response.statusText }, { status: response.status });

  }

  if (body?.color || body?.foregroundColor) {

    const url = new URL(`https://www.googleapis.com/calendar/v3/users/me/calendarList/${encodeURIComponent(googleId)}`);
    url.searchParams.set("colorRgbFormat", "true");

    const payload: Record<string, any> = {};

    if (body?.color) payload.backgroundColor = body.color;
    if (body?.foregroundColor) payload.foregroundColor = body.foregroundColor;

    const colorRes = await fetch(url.toString(), {

      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),

    });
    if (!colorRes.ok) return NextResponse.json({ error: colorRes.statusText }, { status: colorRes.status });

  }

  await prisma.calendar.update({

    where: { id: calendarId },
    data: {
      name: body.name?.trim(),
      description: body.description ?? "",
      icon: body.icon ?? defaults.listIcon,
      color: body.color ?? defaults.listBackgroundColor,
      defaultVisibility: body.defaultVisibility,
    },

  });

  return NextResponse.json({

    id: calendarId,
    name: body.name?.trim(),
    description: body.description ?? "",
    icon: body.icon ?? defaults.listIcon,
    color: body.color ?? defaults.listBackgroundColor,
    defaultVisibility: body.defaultVisibility,

  });
  
}
