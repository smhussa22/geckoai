"use client";
import React from 'react';
import RightPanel from './RightPanel';
import LeftPanel from './LeftPanel';

export default function TailLinkPage() {

    const activeCalendar = false;

    return (

        <>

            <div className="flex flex-row h-full gap-4 p-4">

                <LeftPanel/>
                <RightPanel activeCalendar = {activeCalendar}/>

            </div>

        </>
  
  );

}