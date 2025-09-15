"use client";
import React, { useEffect, useState } from "react";
import EmptyState from "./TailLinkEmptyState";
import ChatContent from "./TailLinkChat";
import TailLinkCalendar from "./TailLinkCal";
import { useCalendar } from "../contexts/SelectedCalendarContext";
import type { ViewMode } from "./ViewToggle";

export default function RightPanel() {
    const { calendar } = useCalendar();
    const [view, setView] = useState<ViewMode>("chat");

    useEffect(() => {
        if (!calendar?.id) return;
        const saved = localStorage.getItem(`view:${calendar.id}`) as ViewMode | null;
        if (saved === "chat" || saved === "calendar") setView(saved);
    }, [calendar?.id]);

    useEffect(() => {
        if (calendar?.id) localStorage.setItem(`view:${calendar.id}`, view);
    }, [view, calendar?.id]);

    if (!calendar) {
        return (
            <div className="relative h-full flex-1 rounded-md border border-neutral-800 p-3 shadow-md">
                <EmptyState />
            </div>
        );
    }

    return (
        <div className="relative h-full flex-1 rounded-md border border-neutral-800 p-3 shadow-md">
            {view === "chat" ? (
                <ChatContent
                    name={calendar.summary}
                    description={calendar.description}
                    isPrimary={calendar.primary}
                    view={view}
                    onChangeView={setView}
                />
            ) : (
                <TailLinkCalendar
                    name={calendar.summary}
                    description={calendar.description}
                    isPrimary={calendar.primary}
                    view={view}
                    onChangeView={setView}
                />
            )}
        </div>
    );
}
