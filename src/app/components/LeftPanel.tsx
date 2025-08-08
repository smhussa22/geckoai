"use client";
import React from 'react';
import CalendarButton from './CalendarButton';
import { HiPlusCircle } from "react-icons/hi";
import { BiCalendar } from 'react-icons/bi';
import CalendarList from './CalendarList';
export default function LeftPanel() {

    return (

        <>

            <div className="border border-neutral-800 shadow-md rounded-md h-full w-64 p-2 flex flex-col">
  
                <h1 className="text-asparagus font-semibold mb-1 text-2xl">Calendars</h1>

                <input autoCapitalize="off" spellCheck={false} autoCorrect="off" placeholder="Search calendars" className="w-full p-0.5 text-s bg-neutral-800 mb-1 text-asparagus placeholder-neutral-600 rounded-md border border-neutral-700 focus:outline-none focus:ring-1 focus:ring-broccoli" type="text" />

                <div className="pr-1.5 mt-0.5 min-h-0 flex-1 overflow-y-auto"> <CalendarList /> </div>

            </div>

        </>

    );

}