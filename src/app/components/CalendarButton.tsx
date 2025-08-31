"use client";
import React from "react";

type ButtonProps = {

  name: string;
  icon: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
  selected: boolean;
  onClick: () => void;

};

const defaultBackground = "#698f3f";
const defaultForeground = "#000000";

export default function CalendarButton({ onClick, name, icon, backgroundColor = defaultBackground, textColor, selected,}: ButtonProps) {

  const foreground = textColor || defaultForeground;

  return (

    <button onClick={onClick}className={`flex flex-row rounded-md w-full hover:scale-105 transition-all duration-200 ${
    !selected && "opacity-75"
  }`}
  style={{ backgroundColor, color: foreground }}
  title={name}
>


      <div className="flex flex-row items-center gap-2 p-1 w-56">

        <span className="shrink-0">{icon}</span>

        <span className="tracking-tighter text-medium block overflow-hidden whitespace-nowrap text-ellipsis font-semibold" style={{ color: foreground }}>

          {name}

        </span>

      </div>

    </button>

  );

}
