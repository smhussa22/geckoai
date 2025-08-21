"use client";
import React from "react";
import { LuCalendarX2, LuCalendarPlus, LuCalendarCog, LuCalendarSearch, LuCalendarMinus, LuCalendarFold } from "react-icons/lu";

type Props = {

    isPrimary: boolean;
    onCreateEvent: () => void;
    onSearchEvents: () => void;
    onOpenSettings: () => void;
    onDeleteCalendar: () => void;  
    onClearEvents: () => void;      
    className?: string;

};

export default function CalendarQuickActions({ isPrimary, onCreateEvent, onSearchEvents, onOpenSettings, onDeleteCalendar, onClearEvents, className = "", }: Props) {
  
    const base = "text-xl flex items-center gap-1 outline outline-neutral-800 transition-colors duration-200 font-semibold tracking-tighter py-3 px-3 rounded-md";

    return (
        
        <div className={`flex gap-2 ${className}`}>

        <button className={`${base} bg-asparagus hover:text-asparagus hover:bg-night`} onClick={onCreateEvent}>

            <LuCalendarPlus size={32} />
            Create Event

        </button>

        <button className={`${base} bg-cyan-700 hover:text-cyan-700 hover:bg-night`} onClick={onSearchEvents}>

            <LuCalendarSearch size={32} />
            Search Events

        </button>

        <button className={`${base} bg-gray-500 hover:text-gray-500 hover:bg-night`} onClick={onOpenSettings}>

            <LuCalendarCog size={32} />
            Calendar Settings

        </button>

        {isPrimary ? (

            <button className={`${base} bg-amber-700 hover:text-amber-700 hover:bg-night`} onClick={onClearEvents}>
                
                <LuCalendarFold size={32} />
                Clear Events

            </button>

        ) : (

            <button className={`${base} bg-red-900 hover:text-red-900 hover:bg-night`} onClick={onDeleteCalendar}>

                <LuCalendarX2 size={32} />
                Delete Calendar

            </button>
        )}

        </div>
    );

}
