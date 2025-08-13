"use client";
import React from "react";

type ButtonProps = {
  
  name: string;
  icon: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
  selected?: boolean;
  onClick?: () => void;

};

export default function CalendarButton({ onClick, name, icon, backgroundColor, textColor, selected }: ButtonProps) {

  return (

    <button
    onClick={onClick}
    className={`hover:opacity-80 border flex flex-row rounded-md w-full ${selected ? 'border-neutral-700' : 'border-transparent'}`}
    style={{ backgroundColor: backgroundColor, color: textColor }}
    >

      <div className="flex flex-row p-1 w-full">
    
        <span className="shrink-0">{icon}</span>
        <span
        className="ml-1 min-w-0 block overflow-hidden whitespace-nowrap text-ellipsis font-semibold"
        title={name}
        >
      
          {name}
    
        </span>
  
      </div>

    </button>

  );

}
