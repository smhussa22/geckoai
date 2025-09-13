'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BsXCircle, BsX } from 'react-icons/bs';
import { TbCalendarDot } from 'react-icons/tb';
import { useCalendar } from '../contexts/SelectedCalendarContext';

type EventItem = {
  id: string;
  name: string;
  description: string;
  start?: string | null;
  end?: string | null;
};

export default function SearchEventsPopup({ onClose }: { onClose?: () => void }) {
  const { calendar } = useCalendar();

  const [search, setSearch] = useState('');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [includePast, setIncludePast] = useState(false);

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    if (!calendar?.id) return;
    fetchedRef.current = true;

    (async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const queryParams = new URLSearchParams({
          scope: 'all',
          singleEvents: 'true',
          orderBy: 'startTime',
        });

        const response = await fetch(
          `/api/calendars/${encodeURIComponent(calendar.id)}/events?${queryParams}`,
        );
        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const req = await response.json();
        const items = Array.isArray(req.items) ? req.items : [];

        const mapped: EventItem[] = items.map((ev: any) => ({
          id: ev.id,
          name: ev.summary || 'Untitled',
          description: ev.description || '',
          start: ev?.start?.dateTime || ev?.start?.date || null,
          end: ev?.end?.dateTime || ev?.end?.date || null,
        }));

        setEvents(mapped);
      } catch (error: any) {
        setErrorMsg(error.message || 'Failed to load events.');
      } finally {
        setLoading(false);
      }
    })();
  }, [calendar?.id]);

  const toMs = (iso?: string | null) => {
    if (!iso) return NaN;
    const t = new Date(iso).getTime();
    return Number.isFinite(t) ? t : NaN;
  };

  const isAllDay = (iso?: string | null) => Boolean(iso && !iso.includes('T'));

  const formatYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${y}/${m}/${da}`;
  };

  const fmtTime = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });

  const formatTimeRange = (startIso?: string | null, endIso?: string | null) => {
    if (!startIso) return 'Time TBD';
    if (isAllDay(startIso)) return 'All day';
    const s = new Date(startIso);
    const e = endIso ? new Date(endIso) : null;
    return e ? `${fmtTime.format(s)} – ${fmtTime.format(e)}` : fmtTime.format(s);
  };

  const formatDateLine = (startIso?: string | null, endIso?: string | null) => {
    if (!startIso) return 'Date TBD';
    const d = new Date(startIso);
    return `${formatYMD(d)} • ${formatTimeRange(startIso, endIso)}`;
  };

  const nowMs = Date.now();

  const filteredSorted = useMemo(() => {
    const pool = events.filter((e) => {
      if (includePast) return true;
      const startMs = toMs(e.start);
      if (Number.isNaN(startMs)) return true;
      return startMs >= nowMs;
    });

    const q = search.trim().toLowerCase();
    const searched = !q
      ? pool
      : pool.filter((e) => {
          const name = (e.name || '').toLowerCase();
          const desc = (e.description || '').toLowerCase();
          return name.includes(q) || desc.includes(q);
        });

    return [...searched].sort((a, b) => {
      const am = toMs(a.start);
      const bm = toMs(b.start);
      if (Number.isNaN(am) && Number.isNaN(bm)) return 0;
      if (Number.isNaN(am)) return 1;
      if (Number.isNaN(bm)) return -1;
      return am - bm;
    });
  }, [events, includePast, search, nowMs]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleDelete = async (e: React.MouseEvent, id?: string) => {
    e.stopPropagation();
    if (!calendar?.id) {
      setErrorMsg('No calendar selected.');
      return;
    }
    if (!id) {
      setErrorMsg('Missing event id.');
      return;
    }

    setErrorMsg(null);
    setDeletingIds((prev) => (prev.includes(id) ? prev : [...prev, id]));

    const snapshot = events;
    setEvents((cur) => cur.filter((ev) => ev.id !== id));
    setExpandedIds((cur) => cur.filter((x) => x !== id));

    try {
      const url = `/api/calendars/${encodeURIComponent(calendar.id)}/events/${encodeURIComponent(
        id,
      )}?sendUpdates=none`;
      const res = await fetch(url, { method: 'DELETE' });

      if (!res.ok) {
        setEvents(snapshot);
        return;
      }
    } catch (error: any) {
      setEvents(snapshot);
      setErrorMsg(error?.message || 'Failed to delete event. Please try again.');
    } finally {
      setDeletingIds((prev) => prev.filter((x) => x !== id));
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="relative flex">
        <div>
          <h1 className="text-2xl font-bold tracking-tighter text-cyan-700">Search Events</h1>
          <h2 className="font-semibold tracking-tighter text-cyan-800">
            Search the events in this calendar.
          </h2>
        </div>

        <button
          onClick={onClose}
          className="absolute right-0 text-neutral-700 transition-colors duration-200 hover:text-neutral-600"
        >
          <BsXCircle size={25} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoCapitalize="off"
          spellCheck={false}
          autoCorrect="off"
          placeholder="Search events…"
          className="text-asparagus focus:ring-broccoli flex-1 rounded-md border border-neutral-700 bg-neutral-800 p-2 tracking-tighter placeholder-neutral-600 focus:ring-1 focus:outline-none"
          type="text"
        />

        <label className="inline-flex items-center gap-2 text-sm text-neutral-300 select-none">
          <input
            type="checkbox"
            checked={includePast}
            onChange={(e) => setIncludePast(e.target.checked)}
            className="h-4 w-4 accent-cyan-700"
          />
          Include past
        </label>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-2">
        {loading ? (
          <div className="p-2 text-sm tracking-tight text-neutral-400">Loading…</div>
        ) : errorMsg ? (
          <div className="p-2 text-sm tracking-tight text-red-400">{errorMsg}</div>
        ) : filteredSorted.length === 0 ? (
          <div className="p-2 text-sm tracking-tight text-neutral-400">No events found.</div>
        ) : (
          <div className="scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent flex max-h-[500px] flex-col gap-1 overflow-y-auto pr-1">
            {filteredSorted.map((event) => {
              const expanded = expandedIds.includes(event.id);
              const isDeleting = deletingIds.includes(event.id);

              return (
                <div key={event.id} className="relative">
                  <button
                    onClick={() => toggleExpand(event.id)}
                    className="w-full rounded-md border border-neutral-800 bg-neutral-800 text-left text-neutral-100 transition-opacity duration-150 hover:opacity-95"
                  >
                    <div className="p-2">
                      <div className="flex items-start gap-2">
                        <span className="flex shrink-0 items-center justify-center text-neutral-200">
                          <TbCalendarDot size={30} />
                        </span>

                        <div className="min-w-0">
                          <div
                            className={`leading-tight font-semibold tracking-tighter ${
                              expanded ? '' : 'overflow-hidden text-ellipsis whitespace-nowrap'
                            }`}
                          >
                            {event.name}
                          </div>

                          <div className="mt-0.5 text-xs text-neutral-300">
                            {formatDateLine(event.start, event.end)}
                          </div>

                          <div
                            className={`text-sm leading-snug text-neutral-200/90 transition-[max-height,opacity,margin] duration-200 ease-out ${
                              expanded ? 'mt-1 max-h-40 opacity-100' : '-mt-1 max-h-0 opacity-0'
                            }`}
                          >
                            {event.description || 'No description.'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={(e) => handleDelete(e, event.id)}
                    disabled={isDeleting}
                    className="absolute top-1 right-1 rounded-md bg-neutral-900/40 p-1 text-neutral-200 transition-colors hover:bg-neutral-900/60 disabled:opacity-50"
                    title={isDeleting ? 'Deleting…' : 'Remove from list'}
                  >
                    <BsX size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
