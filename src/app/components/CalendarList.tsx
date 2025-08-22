"use client";
import React, { useEffect, useMemo, useState } from "react";
import CalendarButton from "./CalendarButton";
import { CgCalendar } from "react-icons/cg";
import { useCalendar } from "../contexts/SelectedCalendarContext";
import type { Calendar } from "../contexts/SelectedCalendarContext";

// @todo add an option to let users refetch if it fails.

export default function CalendarList() {

  const [items, setItems] = useState<Calendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { calendar, setCalendar } = useCalendar();

  useEffect(() => {

    (async () => {

      try {

        const res = await fetch("/api/calendars", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) throw new Error(data?.error || res.statusText);

        setItems(data?.calendars?.items || []);

      } 
      catch (error: any) {

        console.error(error);
        setItems([]);

      } 
      finally {

        setLoading(false);

      }

    })();

  }, []);

  const filtered = useMemo(() => {

    const searchLower = search.trim().toLowerCase();
    if (!searchLower) return items;

    return items.filter((calendar) =>

      (calendar.summary || calendar.id).toLowerCase().includes(searchLower)

    );

  }, [items, search]);

  const handleSelect = (calendar: Calendar) => {

    setCalendar(prev => (prev?.id === calendar.id ? prev : calendar));

  };


  return (

    <>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoCapitalize="off"
        spellCheck={false}
        autoCorrect="off"
        placeholder="Search calendars…"
        className="tracking-tighter p-1 bg-neutral-800 text-asparagus placeholder-neutral-600 rounded-md border border-neutral-700 focus:outline-none focus:ring-1 focus:ring-broccoli w-full"
        type="text"
      />

      <div className="pr-1.5 mt-0.5 min-h-0 flex-1 overflow-y-auto">

        {loading ? (

          <p className="text-neutral-400">Loading…</p>

        ) : filtered.length === 0 ? (

          <p className="text-neutral-500 tracking-tighter text-sm">No calendars match “{search}”.</p>

        ) : (

          <div className="py-1 flex flex-col gap-1 rounded-md">

            {filtered.map((calendar) => (

              <CalendarButton
                key={calendar.id}
                name={calendar.summary}
                icon={<CgCalendar size={30} />}
                backgroundColor={calendar.backgroundColor || "#ffffff"}
                textColor={calendar.foregroundColor || "#000000"}
                selected={calendar?.id === calendar.id}
                onClick={() => handleSelect(calendar)}
              />

            ))}

          </div>

        )}

      </div>

    </>

  );

}

