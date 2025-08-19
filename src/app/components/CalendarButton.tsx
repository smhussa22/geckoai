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

// @todo: if you want auto-contrast text, compute from backgroundColor here

export default function CalendarButton({ onClick, name, icon, backgroundColor = "transparent", textColor = "#e5e5e5", selected, }: ButtonProps) {
  
  return (
  
    <button onClick={onClick} className={`${!selected && 'hover:opacity-90'} transition-all duration-200 border flex flex-row rounded-md w-full ${selected && "opacity-80" }`} style={{ backgroundColor, color: textColor }}>
      
      <div className="flex flex-row items-center gap-2 p-1 w-full">
        
        <span className="shrink-0">{icon}</span>
        <span className="tracking-tighter text-medium min-w-0 block overflow-hidden whitespace-nowrap text-ellipsis font-semibold" title={name} style={{ color: textColor }}>
          
          {name}
        
        </span>
      
      </div>
    
    </button>
  
  );

}
