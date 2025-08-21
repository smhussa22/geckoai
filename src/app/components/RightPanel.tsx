"use client";
import React from 'react';
import EmptyState from './TailLinkEmptyState';
import ChatContent from './TailLinkChat';
import { useCalendar } from '../contexts/SelectedCalendarContext';

export default function RightPanel() {

    const { calendar } = useCalendar();

    return (

        <>

            <div className="border border-neutral-800 shadow-md rounded-md relative h-full flex-1 p-3">
        
                {calendar? <ChatContent name = {calendar.summary} description = {calendar.description} isPrimary = {calendar.primary}/> : <EmptyState/>}

            </div>

        </>

    );

}