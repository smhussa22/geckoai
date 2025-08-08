"use client";
import { TbCalendarQuestion } from "react-icons/tb";

import React from 'react';

export default function TailLinkEmptyState() {

    return (

        <>

            <div className="flex flex-col items-center absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-full gap-2">

                <TbCalendarQuestion size = {75} color="#404040" />
                <span className="text-neutral-700 font-semibold text-xl">Click on a calendar to get started</span>

            </div>

        </>

    );

}