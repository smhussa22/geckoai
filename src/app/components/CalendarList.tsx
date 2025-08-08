"use client";
import React from "react";
import CalendarButton from "./CalendarButton";
import { CgCalendar } from "react-icons/cg";
export default function CalendarList() {

  const calendars = [

    { id: 1, name: "School" },
    { id: 2, name: "Work" },
    { id: 3, name: "Party"},
    { id: 4, name: "School" },
    { id: 5, name: "Work" },
    { id: 6, name: "Party"},
    { id: 7, name: "School" },
    { id: 8, name: "Work" },
    { id: 9, name: "School" },
    { id: 10, name: "Work" },
    { id: 11, name: "Party"},
    { id: 12, name: "Party"},
    { id: 13, name: "School" },
    { id: 14, name: "Work" },
    { id: 15, name: "Party"},
    { id: 16, name: "School" },
    { id: 17, name: "Work" },
    { id: 18, name: "Party"},
    { id: 19, name: "School" },
    { id: 20, name: "Work" },
    { id: 21, name: "Party"},

  ];

  return (

    <>

      <div className='py-1 flex flex-col gap-1 rounded-md'>

        { calendars.map((cal) => ( <CalendarButton name = {cal.name} icon = {<CgCalendar size = {24} />} key={cal.id}/> )) }

      </div>
      

    </>

  );

}
