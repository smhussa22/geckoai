"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { BsXCircle, BsX } from "react-icons/bs";
import { TbCalendarDot } from "react-icons/tb";
import { useCalendar } from "../contexts/SelectedCalendarContext";

type EventItem = {
  id: string;
  name: string;
  description: string;
  start?: string | null;
  end?: string | null;
};

export default function SearchEventsPopup({ onClose }: { onClose?: () => void }) {
  
  const { calendar } = useCalendar();

  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "past">("all");
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

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

            scope: "all",
            singleEvents: "true",
            orderBy: "startTime",

        });

        const response = await fetch(`/api/calendars/${encodeURIComponent(calendar.id)}/events?${queryParams}`);
        if (!response.ok) { throw new Error(`Error: ${response.status}`); }

        const req = await response.json();

        const items = Array.isArray(req.items) ? req.items : [];

        const mapped: EventItem[] = items.map((ev: any) => ({

          id: ev.id,
          name: ev.summary || "Untitled",
          description: ev.description || "",
          start: ev?.start?.dateTime || ev?.start?.date || null,
          end: ev?.end?.dateTime || ev?.end?.date || null,

        }));

          setEvents(mapped);

      } 
      catch (error: any) {

        setErrorMsg(error.message || "Failed to load events.");

      } 
      finally {

        setLoading(false);

      }

    })();

  }, [calendar?.id]);

  const toMs = (iso?: string | null) => {

      if (!iso) return NaN;
      const t = new Date(iso).getTime();
      return Number.isFinite(t) ? t : NaN;

  };

  const nowMs = Date.now();

  const filtered = useMemo(() => {

    const byTab = events.filter((e) => {

      if (activeTab === "all") return true;
      const startMs = toMs(e.start);
      return activeTab === "upcoming" ? startMs >= nowMs : startMs < nowMs;
      
    });

    if (!search.trim()) return byTab;

    const q = search.toLowerCase();

    return byTab.filter((e) => {

      const name = (e.name || "").toLowerCase();
      const desc = (e.description || "").toLowerCase();
      return name.includes(q) || desc.includes(q);

    });

  }, [events, activeTab, search, nowMs]);

  const toggleExpand = (id: string) => {

    setExpandedIds((prev) => {

      if (prev.includes(id)) return prev.filter(existingId => existingId !== id);
      else return [...prev, id];
      
    });

  };

  const handleDelete = async (e: React.MouseEvent, id?: string) => {

    e.stopPropagation();
    if (!calendar?.id) {

      setErrorMsg("No calendar selected.");
      return;

    }
    if (!id) {

      setErrorMsg("Missing event id.");
      return;

    }

    console.log(`Attempting to delete event: ${id} from calendar: ${calendar.id}`);
    
    setErrorMsg(null);
    setDeletingIds((prev) => prev.includes(id) ? prev : [...prev, id]);

    const snapshot = events;

    setEvents((cur) => cur.filter((ev) => ev.id !== id));
    setExpandedIds((cur) => cur.filter(existingId => existingId !== id));

    try {

      const url = `/api/calendars/${encodeURIComponent(calendar.id)}/events/${encodeURIComponent(id)}?sendUpdates=none`;
      
      console.log(`DELETE request to: ${url}`);
      
      const res = await fetch(url, { method: "DELETE" });
      
      console.log(`DELETE response status: ${res.status}`);

      if (!res.ok) {

        let errorData;

        try {

          errorData = await res.json();
          console.log("Error response body:", errorData);

        } catch {

          console.log("Could not parse error response as JSON");

        }

        setErrorMsg(`${res!.status}`);

        setEvents(snapshot);
        
        return;

      }

      console.log(`Event ${id} successfully deleted from Google Calendar`);
      
    } 
    catch (error: any) {

      console.error("Network/fetch error:", error);
      setEvents(snapshot);
      setErrorMsg(error!.message || "Failed to delete event. Please try again.");

    } 
    finally {

      setDeletingIds((prev) => prev.filter(existingId => existingId !== id));
      
    }

  };

  return (

    <div className="w-full space-y-4">

      <div className="flex relative">

        <div>

          <h1 className="text-2xl font-bold tracking-tighter text-cyan-700">Search Events</h1>
          <h2 className="font-semibold tracking-tighter text-cyan-800">Search the events in this calendar.</h2>

        </div>

        <button onClick={onClose} className="absolute right-0 text-neutral-700 transition-colors duration-200 hover:text-neutral-600">

          <BsXCircle size={25} />

        </button>

      </div>

      <div className="inline-flex gap-2 rounded-lg bg-neutral-800 p-1">

        <button onClick={() => setActiveTab("all")} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${ activeTab === "all" ? "bg-neutral-700 text-white" : "text-neutral-300 hover:text-white hover:bg-neutral-700/50"}`}>
        
          All
        
        </button>
        
        <button onClick={() => setActiveTab("upcoming")} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${ activeTab === "all" ? "bg-neutral-700 text-white" : "text-neutral-300 hover:text-white hover:bg-neutral-700/50"}`}>
        
          Upcoming
        
        </button>
        
        <button onClick={() => setActiveTab("past")} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${ activeTab === "all" ? "bg-neutral-700 text-white" : "text-neutral-300 hover:text-white hover:bg-neutral-700/50"}`}>

          Past

        </button>

      </div>

      <div>

        <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoCapitalize="off"
        spellCheck={false}
        autoCorrect="off"
        placeholder="Search events…"
        className="tracking-tighter p-2 bg-neutral-800 text-asparagus placeholder-neutral-600 rounded-md border border-neutral-700 focus:outline-none focus:ring-1 focus:ring-broccoli w-full"
        type="text"
        />

      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-2">
        
        {loading ? (
          <div className="text-neutral-400 text-sm tracking-tight p-2">Loading…</div>
        ) : errorMsg ? (
          <div className="text-red-400 text-sm tracking-tight p-2">{errorMsg}</div>
        ) : filtered.length === 0 ? (
          <div className="text-neutral-400 text-sm tracking-tight p-2">No events found.</div>
        ) : (

          <div className="flex flex-col gap-1">

            {filtered.map((event) => {

              const expanded = expandedIds.includes(event.id);
              const isDeleting = deletingIds.includes(event.id);

              return (

                <div key={event.id} className="relative">

                  <button onClick={() => toggleExpand(event.id)} className="w-full rounded-md border border-neutral-800 bg-neutral-800 text-neutral-100 transition-opacity duration-150 hover:opacity-95 text-left">

                    <div className="p-2">
                    
                      <div className="flex items-start gap-2">
                    
                        <span className="h-5 w-5 shrink-0 flex items-center justify-center text-neutral-200">
                    
                          <TbCalendarDot size={18} />
                    
                        </span>

                        <div className="min-w-0">
                    
                          <div className={`tracking-tighter font-semibold leading-tight ${ expanded ? "" : "overflow-hidden whitespace-nowrap text-ellipsis"}`}>

                            {event.name}

                          </div>

                          <div className={`text-sm text-neutral-200/90 leading-snug transition-[max-height,opacity,margin] duration-200 ease-out ${ expanded ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0 -mt-1" }`}>

                            {event.description || "No description."}

                          </div>

                        </div>

                      </div>

                    </div>

                  </button>

                  <button
                  onClick={(e) => handleDelete(e, event.id)}
                  disabled={isDeleting}
                  className="absolute right-1 top-1 rounded-md p-1 text-neutral-200 bg-neutral-900/40 hover:bg-neutral-900/60 disabled:opacity-50 transition-colors"
                  title={isDeleting ? "Deleting…" : "Remove from list"}
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