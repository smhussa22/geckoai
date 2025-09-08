"use client";

import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
  Calendar as RBC,
  dateFnsLocalizer,
  type Event as RBCEvent,
  Views,
  type View,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import {enUS} from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useCalendar } from "../contexts/SelectedCalendarContext";

type GoogleDate = { date?: string; dateTime?: string; timeZone?: string };
type GoogleEvent = {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  start: GoogleDate;
  end: GoogleDate;
};

type CalendarEvent = RBCEvent & {
  id: string;
  description?: string;
  location?: string;
  allDay?: boolean;
  resource?: any;
};

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

function pickGoogleDate(g?: GoogleDate): Date | null {
  if (!g) return null;
  if (g.dateTime) {
    const d = new Date(g.dateTime);
    return Number.isNaN(+d) ? null : d;
  }
  if (g.date) return new Date(`${g.date}T00:00:00`);
  return null;
}

function adaptGoogle(e: GoogleEvent): CalendarEvent | null {
  const start = pickGoogleDate(e.start);
  const end = pickGoogleDate(e.end);
  if (!start || !end) return null;
  const allDay = !!(e.start.date && e.end?.date);
  return {
    id: e.id,
    title: e.summary || "(No title)",
    start,
    end,
    allDay,
    description: e.description,
    location: e.location,
    resource: e,
  };
}

function GridEvent({ event }: { event: CalendarEvent }) {
  const timeStr = event.allDay
    ? "All day"
    : `${format(event.start as Date, "p")}–${format(event.end as Date, "p")}`;
  return (
    <div className="pointer-events-none select-none leading-tight">
      <div className="font-semibold truncate">{event.title}</div>
      <div className="text-xs opacity-90">{timeStr}</div>
      {event.description ? (
        <div className="text-xs mt-0.5 line-clamp-2 opacity-80">{event.description}</div>
      ) : null}
    </div>
  );
}

function MinimalToolbar({
  label,
  onNavigate,
}: {
  label: string;
  onNavigate: (action: "PREV" | "NEXT") => void;
}) {
  return (
    <div className="rbc-toolbar flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button className="rbc-btn" onClick={() => onNavigate("PREV")}>‹</button>
        <button className="rbc-btn" onClick={() => onNavigate("NEXT")}>›</button>
      </div>
      <div className="font-medium">{label}</div>
      <div />
    </div>
  );
}

export default function BigCalendarRemote() {
  const { calendar } = useCalendar();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<View>(Views.MONTH);
  const rangeRef = useRef<{ start?: Date; end?: Date }>({});

  const colors = useMemo(() => {
    return {
      bg: calendar?.backgroundColor || "#2c885b",
      fg: calendar?.foregroundColor || "#0b0b0c",
    };
  }, [calendar?.backgroundColor, calendar?.foregroundColor]);

  const fetchEventsForRange = useCallback(
    async (start?: Date, end?: Date) => {
      if (!calendar?.id) return;
      setErrorMsg(null);
      try {
        const base = new URL(`/api/calendars/${calendar.id}/events`, window.location.origin);
        if (start) base.searchParams.set("start", start.toISOString());
        if (end) base.searchParams.set("end", end.toISOString());
        base.searchParams.set("maxResults", "250");

        let pageUrl = base;
        const out: CalendarEvent[] = [];

        for (let i = 0; i < 10; i++) {
          const res = await fetch(pageUrl.toString(), { cache: "no-store" });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          const items = (data?.items ?? []) as GoogleEvent[];
          out.push(...items.map(adaptGoogle).filter(Boolean) as CalendarEvent[]);
          const token = data?.nextPageToken as string | undefined;
          if (!token) break;
          pageUrl = new URL(pageUrl);
          pageUrl.searchParams.set("pageToken", token);
        }

        setEvents(out);
      } catch (e: any) {
        setErrorMsg(e?.message || "Failed to load events");
        setEvents([]);
      }
    },
    [calendar?.id]
  );

  const onRangeChange = useCallback(
    (range: Date[] | { start: Date; end: Date }) => {
      let start: Date | undefined;
      let end: Date | undefined;
      if (Array.isArray(range)) {
        start = range[0];
        end = range[range.length - 1];
      } else {
        start = range.start;
        end = range.end;
      }
      rangeRef.current = { start, end };
      fetchEventsForRange(start, end);
    },
    [fetchEventsForRange]
  );

  useEffect(() => {
    if (!rangeRef.current.start && !rangeRef.current.end) {
      fetchEventsForRange();
    }
  }, [fetchEventsForRange]);

  return (
    <div
      className="rounded-xl border border-neutral-800 shadow-xl"
      style={{
        height: "53rem",
        width: "100%",
        padding: "1.5rem",
        backgroundColor: "#131112",
        fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
        color: "#e7e7ea",
      }}
    >
      {errorMsg ? (
        <div style={{ marginBottom: 8, color: "#f87171" }}>{errorMsg}</div>
      ) : null}

      <RBC
        localizer={localizer}
        events={events}
        date={date}
        view={view}
        onNavigate={(d) => setDate(d)}
        onView={(v) => setView(v)}
        onRangeChange={onRangeChange}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        toolbar
        popup
        popupOffset={{ x: 10, y: 10 }}
        selectable={false}
        drilldownView={undefined}
        views={["month", "week"]}
        step={30}
        timeslots={1}
        components={{
          event: GridEvent as any,
          toolbar: (props) => (
            <MinimalToolbar
              label={props.label}
              onNavigate={(a) =>
                a === "PREV" ? props.onNavigate("PREV") : props.onNavigate("NEXT")
              }
            />
          ),
        }}
        eventPropGetter={() => ({
          style: {
            backgroundColor: colors.bg,
            color: colors.fg,
            borderRadius: "0.375rem",
            border: "none",
            padding: "2px 6px",
          },
        })}
        messages={{ allDay: "All day" }}
      />
    </div>
  );
}
