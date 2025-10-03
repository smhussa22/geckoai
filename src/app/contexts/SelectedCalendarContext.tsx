"use client";
import { createContext, useState, useContext, useMemo } from "react";

export type Calendar = {
    id: string;
    googleId: string;
    summary: string;
    description?: string;
    backgroundColor: string;
    foregroundColor: string;
    primary: boolean;
};

type SelectedCalendarContext = {
    calendar: Calendar | null;
    setCalendar: React.Dispatch<React.SetStateAction<Calendar | null>>;
    refreshCalendars: () => void;
    setRefreshCalendars: React.Dispatch<React.SetStateAction<() => void>>;
};

const Context = createContext<SelectedCalendarContext | undefined>(undefined);

export const CalendarProvider = ({ children }: { children: React.ReactNode }) => {
    const [calendar, setCalendar] = useState<Calendar | null>(null);
    const [refreshCalendars, setRefreshCalendars] = useState<() => void>(() => () => {});
    const value = useMemo(
        () => ({ calendar, setCalendar, refreshCalendars, setRefreshCalendars }),
        [calendar, refreshCalendars]
    );

    return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useCalendar = () => {
    const context = useContext(Context);
    if (!context) throw new Error("useCalendar must be used within CalendarProvider");
    return context;
};
