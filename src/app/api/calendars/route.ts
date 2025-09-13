'use server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/app/lib/prisma';

const sessionSecret = new TextEncoder().encode(process.env.SESSION_SECRET!);
const defaults = {
  listIcon: 'user',
  listBackgroundColor: '#698f3f',
  calendarDefaultVisibility: 'DEFAULT' as const,
};

export async function GET() {
  const session = (await cookies()).get('ga_session')?.value;
  if (!session)
    return NextResponse.json(
      { error: 'METHOD: Calendars/GET, ERROR: Failure retrieving cookie session' },
      { status: 401 },
    );

  try {
    const { payload } = await jwtVerify(session, sessionSecret);
    const userId = payload.userId as string;

    const googleToken = await prisma.googleToken.findUnique({ where: { userId } });
    if (!googleToken)
      return NextResponse.json(
        { error: 'METHOD: Calendars/GET, ERROR: No Google Token' },
        { status: 400 },
      );

    const calendarListResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      { headers: { Authorization: `Bearer ${googleToken.accessToken}` } },
    );
    if (!calendarListResponse.ok)
      return NextResponse.json(
        { error: 'METHOD: Calendars/GET, ERROR: Calendar Fetch Error' },
        { status: calendarListResponse.status },
      );

    const calendarListData = await calendarListResponse.json();
    const googleCalendars = Array.isArray(calendarListData?.items) ? calendarListData.items : [];
    const googleCalendarIds: string[] = googleCalendars.map(
      (calendar: any) => calendar.id as string,
    );

    const existing = googleCalendarIds.length
      ? await prisma.calendar.findMany({
          where: { ownerId: userId, googleId: { in: googleCalendarIds } },
          select: {
            id: true,
            googleId: true,
            name: true,
            description: true,
            color: true,
            icon: true,
            defaultVisibility: true,
          },
        })
      : [];

    const byGoogleId = new Map(existing.map((calendar) => [calendar.googleId, calendar]));

    const missing = googleCalendarIds.filter((gid) => !byGoogleId.has(gid));

    if (missing.length) {
      await prisma.$transaction(
        missing.map((gid) =>
          prisma.calendar.create({
            data: {
              ownerId: userId,
              googleId: gid,
              name: gid,
              description: '',
              icon: defaults.listIcon,
              color: defaults.listBackgroundColor,
              defaultVisibility: defaults.calendarDefaultVisibility,
            },
          }),
        ),
      );

      const all = await prisma.calendar.findMany({
        where: { ownerId: userId, googleId: { in: googleCalendarIds } },
        select: {
          id: true,
          googleId: true,
          name: true,
          description: true,
          color: true,
          icon: true,
          defaultVisibility: true,
        },
      });
      byGoogleId.clear();
      all.forEach((calendar) => byGoogleId.set(calendar.googleId, calendar));
    }

    const mergedCalendars = googleCalendars.map((google: any) => {
      const pref = byGoogleId.get(google.id);

      return {
        id: pref?.id,
        googleId: google.id,
        summary: google.summaryOverride ?? google.summary ?? pref?.name ?? google.id,
        description: pref?.description ?? google.description ?? '',
        backgroundColor: pref?.color ?? google.backgroundColor ?? defaults.listBackgroundColor,
        iconKey: pref?.icon ?? defaults.listIcon,
        defaultVisibility: pref?.defaultVisibility ?? defaults.calendarDefaultVisibility,
        foregroundColor: google.foregroundColor,
        primary: google.primary ?? false,
        accessRole: google.accessRole,
      };
    });

    const timeZoneResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/users/me/settings/timezone',

      { headers: { Authorization: `Bearer ${googleToken.accessToken}` } },
    );
    if (!timeZoneResponse.ok)
      return NextResponse.json(
        { error: 'METHOD: Calendars/GET, ERROR: Time Zone Fetch Error' },
        { status: timeZoneResponse.status },
      );

    const timeZoneData = await timeZoneResponse.json().catch(() => null);

    return NextResponse.json({
      calendars: { ...calendarListData, items: mergedCalendars },
      items: mergedCalendars.map((calendar: any) => ({
        id: calendar.id,
        googleId: calendar.googleId,
        summary: calendar.summary,
        description: calendar.description,
        iconKey: calendar.iconKey,
        backgroundColor: calendar.backgroundColor,
        foregroundColor: calendar.foregroundColor,
        defaultVisibility: calendar.defaultVisibility,
        primary: calendar.primary,
        accessRole: calendar.accessRole,
      })),
      defaultTimeZone: timeZoneData?.value ?? null,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          `METHOD: Calendars/GET, ERROR: ${error?.message}` ||
          'METHOD: Calendars/GET, ERROR: Internal Error',
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const session = (await cookies()).get('ga_session')?.value;
  if (!session)
    return NextResponse.json(
      { error: 'METHOD: Calendars/POST, ERROR: Failure retrieving cookie session' },
      { status: 401 },
    );

  try {
    const { payload } = await jwtVerify(session, sessionSecret);
    const userId = payload.userId as string;

    const googleToken = await prisma.googleToken.findUnique({ where: { userId } });
    if (!googleToken)
      return NextResponse.json(
        { error: 'METHOD: Calendars/POST, ERROR: No Google Token' },
        { status: 401 },
      );

    const body = (await req.json()) as {
      summary?: string;
      description?: string;
      timeZone?: string;
    } | null;

    const summary = body?.summary?.trim();
    const description = body?.description ?? '';
    const timeZone = body?.timeZone?.trim();

    if (!summary || !timeZone) {
      return NextResponse.json(
        { error: 'METHOD: Calendars/POST, ERROR: Name & Time Zone required' },
        { status: 400 },
      );
    }

    const googleResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${googleToken.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ summary, description, timeZone }),
    });

    if (!googleResponse.ok)
      return NextResponse.json(
        { error: 'METHOD: Calendars/POST, ERROR: Calendar API Response Failed' },
        { status: googleResponse.status },
      );

    const data = await googleResponse.json();

    await prisma.calendar.upsert({
      where: { ownerId_googleId: { ownerId: userId, googleId: data.id } },
      update: {
        name: data.summary ?? summary,
        summary: data.summary ?? summary,
        description: data.description ?? description,
        icon: defaults.listIcon,
        color: defaults.listBackgroundColor,
        defaultVisibility: defaults.calendarDefaultVisibility,
        deletedAt: null,
      },
      create: {
        ownerId: userId,
        googleId: data.id,
        name: data.summary ?? summary,
        summary: data.summary ?? summary,
        description: data.description ?? description,
        icon: defaults.listIcon,
        color: defaults.listBackgroundColor,
        defaultVisibility: defaults.calendarDefaultVisibility,
      },
    });

    const db = await prisma.calendar.findUnique({
      where: { ownerId_googleId: { ownerId: userId, googleId: data.id } },
      select: { id: true, googleId: true },
    });

    return NextResponse.json(
      {
        ...data,
        id: db?.id,
        googleId: data.id,
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'METHOD: Calendars/POST, ERROR: Internal Service Error' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  const session = (await cookies()).get('ga_session')?.value;
  if (!session)
    return NextResponse.json(
      {
        error:
          'METHOD: Calendars/DELETE, ERROR: Error reading session/User may not be logged in; please log in again by refreshing',
      },
      { status: 401 },
    );

  try {
    const { payload } = await jwtVerify(session, sessionSecret);
    const userId = payload.userId as string;

    const googleToken = await prisma.googleToken.findUnique({ where: { userId } });
    if (!googleToken)
      return NextResponse.json(
        { error: 'METHOD: Calendars/DELETE, ERROR: No Google Token Available' },
        { status: 401 },
      );

    const contentType = req.headers.get('content-type')?.toLowerCase() || '';
    if (!contentType.includes('application/json'))
      return NextResponse.json(
        { error: 'METHOD: Calendars/DELETE, ERROR: Content Type must be application/json' },
        { status: 415 },
      );

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'METHOD: Calendars/DELETE, ERROR: Invalid JSON body' },
        { status: 400 },
      );
    }

    const dbCalendarId = typeof body?.calendarId === 'string' ? body.calendarId.trim() : '';
    if (!dbCalendarId) {
      return NextResponse.json(
        { error: 'METHOD: Calendars/DELETE, ERROR: calendarId (DB id) required' },
        { status: 400 },
      );
    }

    const dbCalendar = await prisma.calendar.findFirst({
      where: { id: dbCalendarId, ownerId: userId },
      select: { googleId: true },
    });
    if (!dbCalendar)
      return NextResponse.json(
        { success: true, calendarId: dbCalendarId, mode: 'not_found_locally' },
        { status: 200 },
      );

    const googleId = dbCalendar.googleId;
    if (googleId.toLowerCase() === 'primary')
      return NextResponse.json(
        { error: 'METHOD: Calendars/DELETE, ERROR: Primary calendar cannot be deleted' },
        { status: 403 },
      );

    const responseMetaData = await fetch(
      `https://www.googleapis.com/calendar/v3/users/me/calendarList/${encodeURIComponent(googleId)}`,
      { headers: { Authorization: `Bearer ${googleToken.accessToken}` } },
    );

    if (responseMetaData.status === 404) {
      await prisma.calendar.deleteMany({ where: { ownerId: userId, id: dbCalendarId } });
      return NextResponse.json(
        { success: true, calendarId: dbCalendarId, mode: 'not_found_on_google' },
        { status: 200 },
      );
    }
    if (!responseMetaData.ok)
      return NextResponse.json(
        { error: `METHOD: Calendars/DELETE, ERROR: Failed to fetch calendar` },
        { status: responseMetaData.status },
      );

    const meta = await responseMetaData.json();
    if (meta?.primary === true)
      return NextResponse.json(
        { error: 'METHOD: Calendars/DELETE, ERROR: Primary calendar cannot be deleted' },
        { status: 403 },
      );

    const isOwner = meta?.accessRole === 'owner';
    const endpoint = isOwner
      ? `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(googleId)}`
      : `https://www.googleapis.com/calendar/v3/users/me/calendarList/${encodeURIComponent(googleId)}`;

    const deletion = await fetch(endpoint, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${googleToken.accessToken}` },
    });

    if (!deletion.ok)
      return NextResponse.json(
        { error: `METHOD: Calendars/DELETE, ERROR: Failed to delete calendar` },
        { status: deletion.status },
      );

    await prisma.calendar.deleteMany({ where: { ownerId: userId, id: dbCalendarId } });

    return NextResponse.json(
      { success: true, calendarId: dbCalendarId, mode: isOwner ? 'permanent' : 'unsubscribe' },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal Service Error' },
      { status: 500 },
    );
  }
}
