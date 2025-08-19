"use client";
import React from 'react';
import { useState } from 'react';
import { LuCalendarPlus } from "react-icons/lu";
import CalendarList from './CalendarList';
import PopUp from './Popup';
import CreateCalendarPage from './CreateCalendarPopup';

export default function LeftPanel() {

    const [isOpen, toggleIsOpen] = useState(false);

    const handleClosePopup = () => {

        toggleIsOpen(false);
        
    };

    return (

        <>
            <div className="border border-neutral-800 shadow-md rounded-md h-full w-64 p-2 flex flex-col gap-1">
  
                <div className="flex flex-row items-center relative">
  
                    <h1 className="text-asparagus font-bold text-2xl tracking-tighter">Calendars</h1>

                    <button onClick={() => toggleIsOpen(!isOpen)} className='absolute right-0'>

                        <LuCalendarPlus size={25} color='#698f3f'/>
                        
                    </button>

                </div>

                <CalendarList />

            </div>

            {isOpen && (

                <PopUp className='flex flex-col gap-4' onClose={handleClosePopup}>

                    <CreateCalendarPage onClose={handleClosePopup} />

                </PopUp>

            )}

        </>

    );

}