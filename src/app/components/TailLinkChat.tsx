"use client";
import { TbCalendarX } from "react-icons/tb";
import { FaPaintBrush } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import React from 'react';

export default function TailLinkChat() {

    return (

        <>

            <div className='bg-neutral-900 border border-neutral-800 p-2 relative rounded-md flex gap-3'>

                <div>

                    <h1 className='tracking-tighter font-semibold text-asparagus text-xl'>Calendar Name</h1>
                    <h2 className='tracking-tighter text-broccoli'>A telling description of the calendar.</h2>

                </div>

                <button className="flex items-center gap-1 text-xl bg-neutral-700 rounded-md p-1.5">

                    <TbCalendarX size = {32}/>
                    <span>Delete Calendar</span>

                </button>

                <button className="flex items-center gap-1 text-xl bg-neutral-700 rounded-md p-1.5">

                    <TbCalendarX size = {32}/>
                    <span>Delete Calendar</span>

                </button>

                <button className="flex items-center gap-1 text-xl bg-neutral-700 rounded-md p-1.5">

                    <TbCalendarX size = {32}/>
                    <span>Delete Calendar</span>

                </button>

                <button className="flex items-center gap-1 text-xl bg-neutral-700 rounded-md p-1.5">

                    <TbCalendarX size = {32}/>
                    <span>Delete Calendar</span>

                </button>

            </div>

            <input placeholder="Add some helpful instructions to help AI schedule your calendar." className="w-full bg-amber-50 absolute bottom-1 rounded-md"></input>

        </>

    );

}