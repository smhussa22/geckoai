"use client";
import React from 'react';
import EmptyState from './TailLinkEmptyState';
import ChatContent from './TailLinkChat';

type PanelProps = {

    activeCalendar: false;

}

export default function RightPanel({activeCalendar}: PanelProps) {

    return (

        <>

            <div className="border border-neutral-800 shadow-md rounded-md h-full flex-1">
        
                {activeCalendar ? <ChatContent/> : <EmptyState/>}

            </div>

        </>

    );

}