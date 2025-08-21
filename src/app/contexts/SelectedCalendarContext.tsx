'use client';
import { createContext, useState, useContext, useMemo } from 'react';

export type Calendar = {

    id: string;
    summary: string;
    description?: string;
    backgroundColor: string;
    foregroundColor: string;
    primary: boolean;

}

type SelectedCalendarContext = {

    calendar: Calendar | null;
    setCalendar: React.Dispatch<React.SetStateAction<Calendar | null>>;

}

const Context = createContext<SelectedCalendarContext | undefined>(undefined);

export const CalendarProvider = ({ children }: { children: React.ReactNode }) => {

    const [calendar, setCalendar] = useState<Calendar | null>(null);
    const value = useMemo( () => ( { calendar, setCalendar }), [calendar] );

    return ( <Context.Provider value = {value}>{children}</Context.Provider> );

};

export const useCalendar = () => { 

    const context = useContext(Context);
    if (!context) throw new Error("useCalendar must be used within CalendarProvider");
    return context;

}