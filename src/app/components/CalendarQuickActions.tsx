"use client";
import React from "react";
import { LuCalendarX2, LuCalendarPlus, LuCalendarCog, LuCalendarSearch, LuCalendarFold } from "react-icons/lu";

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

    const base = "flex items-center gap-1.5 rounded-md border transition-colors duration-200 text-sm font-medium px-3 py-2";

    return (

        <div className={`flex flex-wrap gap-2 ${className}`}>

            <button onClick={onCreateEvent} className={`${base} border-asparagus/40 bg-asparagus/10 text-asparagus hover:bg-asparagus/20`}>
        
                <LuCalendarPlus size={18} /> Create Event
      
            </button>

            <button onClick={onSearchEvents} className={`${base} border-cyan-500/40 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20`}>
                
                <LuCalendarSearch size={18} /> Search Events
      
            </button>

            <button onClick={onOpenSettings} className={`${base} border-neutral-500/40 bg-neutral-500/10 text-neutral-400 hover:bg-neutral-500/20`}>
        
                <LuCalendarCog size={18} /> Calendar Settings
      
            </button>

            {isPrimary ? (
            
                <button onClick={onClearEvents} className={`${base} border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20`}>

                    <LuCalendarFold size={18} /> Clear Events
        
                </button>
      
                ) : (
        
                <button onClick={onDeleteCalendar} className={`${base} border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20`} >
          
                    <LuCalendarX2 size={18} /> Delete Calendar
        
                </button>
      
            )}
    
        </div>
  
    );

}
