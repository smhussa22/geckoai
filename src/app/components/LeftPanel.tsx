"use client";
import React from 'react';
import { useState } from 'react';
import CalendarButton from './CalendarButton';
import { FiPlusCircle } from "react-icons/fi";
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
  
                    <h1 className="text-asparagus font-bold text-2xl">Calendars</h1>

                    <button onClick={() => toggleIsOpen(!isOpen)} className='absolute right-0'>

                        <FiPlusCircle size={25} color='#698f3f'/>
                        
                    </button>

                </div>

                <input 
                    autoCapitalize="off" 
                    spellCheck={false} 
                    autoCorrect="off" 
                    placeholder="Search calendars" 
                    className="p-1 bg-neutral-800 text-asparagus placeholder-neutral-600 rounded-md border border-neutral-700 focus:outline-none focus:ring-1 focus:ring-broccoli" 
                    type="text" 
                />

                <div className="pr-1.5 mt-0.5 min-h-0 flex-1 overflow-y-auto">

                    <CalendarList />

                </div>
                
            </div>

            {isOpen && (

                <PopUp className='flex flex-col gap-4' onClose={handleClosePopup}>

                    <CreateCalendarPage onClose={handleClosePopup} />

                </PopUp>

            )}

        </>

    );

}