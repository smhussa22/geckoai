"use client";
import React, { useEffect, useMemo, useState } from "react";
import CalendarButton from "./CalendarButton";
import { useCalendar } from "../contexts/SelectedCalendarContext";
import type { Calendar } from "../contexts/SelectedCalendarContext";
import { TbCalendarHeart, TbCalendarDot, TbCalendarCode, TbCalendarClock, TbCalendarDollar, TbCalendarStar, TbCalendarPin, TbCalendarUser } from "react-icons/tb";

const defaultBackground = "#698f3f";

const iconProps = {

  size: 30

}
const iconMap = {

  heart: <TbCalendarHeart {...iconProps} />,
  dot:   <TbCalendarDot   {...iconProps}  />,
  code:  <TbCalendarCode  {...iconProps}  />,
  clock: <TbCalendarClock {...iconProps}  />,
  dollar:<TbCalendarDollar {...iconProps}  />,
  star:  <TbCalendarStar  {...iconProps}  />,
  pin:   <TbCalendarPin   {...iconProps} />,
  user:  <TbCalendarUser  {...iconProps} />,

};

export default function CalendarList() {

  const [items, setItems] = useState<Calendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { calendar: selectedCalendar, setCalendar } = useCalendar();

  useEffect(() => {

    (async () => {

      try {

        const res = await fetch("/api/calendars", { cache: "no-store" });
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();

        const list = data?.items ?? data?.calendars?.items ?? [];
        setItems(list);

      } 
      catch (error) {

        console.error(error);
        setItems([]);

      } 
      finally {

        setLoading(false);
      }

    })();

  }, []);

  const filtered = useMemo(() => {

    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c: any) => (c.summary || c.id).toLowerCase().includes(q));

  }, [items, search]);

  const handleSelect = async (cal: Calendar) => {

    setCalendar((prev) => (prev?.id === cal.id ? prev : cal));
    

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

      <div className="pr-1.5 mt-0.5 min-h-0 flex-1">

        {loading ? (

          <p className="text-neutral-400">Loading…</p>

        ) : filtered.length === 0 ? (

          <p className="text-neutral-500 tracking-tighter text-sm">

            No calendars match “{search}”.

          </p>

        ) : (

          <div className="py-1 flex flex-col gap-1 rounded-md">

            {filtered.map((cal: any) => {

              const iconKey = (cal.iconKey || "user") as keyof typeof iconMap;
              const iconNode = iconMap[iconKey] ?? iconMap.user;

              const bg = cal.backgroundColor || defaultBackground;
              const fg = cal.foregroundColor || null; 

              return (

                <CalendarButton

                  key={cal.id}
                  name={cal.summary}
                  icon={iconNode}
                  backgroundColor={bg}
                  textColor={fg}
                  selected={selectedCalendar?.id === cal.id}
                  onClick={() => handleSelect(cal)}

                />

              );

            })}

          </div>

        )}

      </div>

    </>

  );
  
}
