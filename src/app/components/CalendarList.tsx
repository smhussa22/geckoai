"use client";
import React from "react";
import CalendarButton from "./CalendarButton";
import { CgCalendar } from "react-icons/cg";
export default function CalendarList() {

  const calendars = [

    { id: 1, name: "School" },
    { id: 2, name: "Work" },
    { id: 3, name: "Party"}

  ];

  return (

    <>

      <div className='py-1 flex flex-col gap-1 h-18'>

        { calendars.map((cal) => ( <CalendarButton name = {cal.name} icon = {<CgCalendar size = {24} />} key={cal.id}/> )) }

      </div>
      

    </>

  );

}
