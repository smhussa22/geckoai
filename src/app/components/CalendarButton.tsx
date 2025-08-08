"use client";
import React from "react";

type ButtonProps = {
  
  name: string;
  icon: React.ReactNode;

};

export default function CalendarButton({ name, icon }: ButtonProps) {

  return (

    <button className={`hover:opacity-80 transition-colors duration-300 flex flex-row rounded-md w-full`}>

      <div className="flex flex-row p-1">

        {icon}
        <h1 className="ml-1 font-semibold">{name}</h1>

      </div>

    </button>

  );

}
