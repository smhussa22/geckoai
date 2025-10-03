"use client";
import React, { useMemo, useState } from "react";
import CalendarButton from "./CalendarButton";
import { useCalendar } from "../contexts/SelectedCalendarContext";
import type { Calendar } from "../contexts/SelectedCalendarContext";
import {
    TbCalendarHeart,
    TbCalendarDot,
    TbCalendarCode,
    TbCalendarClock,
    TbCalendarDollar,
    TbCalendarStar,
    TbCalendarPin,
    TbCalendarUser,
} from "react-icons/tb";
import useSWR from "swr";

const defaultBackground = "#698f3f";

const iconProps = { size: 30 };
const iconMap = {
    heart: <TbCalendarHeart {...iconProps} />,
    dot: <TbCalendarDot {...iconProps} />,
    code: <TbCalendarCode {...iconProps} />,
    clock: <TbCalendarClock {...iconProps} />,
    dollar: <TbCalendarDollar {...iconProps} />,
    star: <TbCalendarStar {...iconProps} />,
    pin: <TbCalendarPin {...iconProps} />,
    user: <TbCalendarUser {...iconProps} />,
};

// API response type
type CalendarApiResponse = { items: Calendar[] } | { calendars: { items: Calendar[] } };

const fetcher = async (url: string): Promise<CalendarApiResponse> => {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
};

export default function CalendarList() {
    const [search, setSearch] = useState("");
    const { calendar: selectedCalendar, setCalendar } = useCalendar();

    const { data, error, isLoading } = useSWR<CalendarApiResponse>("/api/calendars", fetcher);

    let items: Calendar[] = [];
    if (data) {
        if ("items" in data) items = data.items;
        else if ("calendars" in data) items = data.calendars.items;
    }

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return items;
        return items.filter((c) => (c.summary || c.id).toLowerCase().includes(q));
    }, [items, search]);

    const handleSelect = (cal: Calendar) => {
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
                className="text-asparagus focus:ring-broccoli w-full rounded-md border border-neutral-700 bg-neutral-800 p-1 tracking-tighter placeholder-neutral-600 focus:ring-1 focus:outline-none"
                type="text"
            />

            <div className="mt-0.5 min-h-0 flex-1 pr-1.5">
                {isLoading ? (
                    <p className="text-neutral-400">Loading…</p>
                ) : error ? (
                    <p className="text-sm text-red-500">Failed to load calendars.</p>
                ) : filtered.length === 0 ? (
                    <p className="text-sm tracking-tighter text-neutral-500">
                        No calendars match “{search}”.
                    </p>
                ) : (
                    <div className="flex flex-col gap-1 rounded-md py-1">
                        {filtered.map((cal) => {
                            const iconKey =
                                (cal as { iconKey?: keyof typeof iconMap }).iconKey ?? "user";
                            const iconNode = iconMap[iconKey] ?? iconMap.user;

                            const bg = cal.backgroundColor || defaultBackground;
                            const fg = cal.foregroundColor ?? null;

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
