"use client";
import { TbCalendarQuestion } from "react-icons/tb";

import React from 'react';

export default function TailLinkEmptyState() {

    return (

        <>

            <div className="flex flex-col items-center absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-full gap-20">

                <TbCalendarQuestion size = {250} color="#698f3f" />
                <span className="text-asparagus font-semibold text-7xl">Click on a calendar to get started</span>

            </div>

        </>

    );

}