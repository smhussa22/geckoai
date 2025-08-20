"use client";
import React, { useRef, useState, useEffect } from "react";
import PrimaryBadge from "./PrimaryBadge";
import CalendarQuickActions from "./CalendarQuickActions";

type TailLinkChatProps = {

    name: string;
    description?: string;
    isPrimary: boolean;
    onCreateEvent?: () => void;
    onSearchEvents?: () => void;
    onOpenSettings?: () => void;
    onDeleteCalendar?: () => void;
    onClearEvents?: () => void;
    className?: string;

};


export default function TailLinkChat({ name = "Calendar Name", description = "There are fifty characters in this large sentence.", isPrimary, onCreateEvent = () => console.log("Create Event"), onSearchEvents = () => console.log("Search Events"), onOpenSettings = () => console.log("Calendar Settings"), onDeleteCalendar = () => console.log("Delete Calendar"), onClearEvents = () => console.log("Clear Events"), className = "", }: TailLinkChatProps) {
    
    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {

        const el = textareaRef.current;
        if (!el) return;

        el.style.height = "auto";

        const baseHeight = el.scrollHeight < el.clientHeight ? el.clientHeight : el.clientHeight;

        el.style.height = Math.max(baseHeight, el.scrollHeight) + "px";

    }, [value]);

  return (

        <div className={`relative h-full flex flex-col ${className}`}>

        <div className="flex items-center gap-2 relative">
            
            <div className="w-fit">

                <div className="flex items-center gap-2">

                    <h1 className="tracking-tighter font-semibold text-asparagus text-[1.25rem] sm:text-[1.5rem]">

                        {name}

                    </h1>

                    <PrimaryBadge show={isPrimary} />

                </div>

                {description ? (

                    <h2 className="tracking-tighter text-broccoli text-[1.125rem] sm:text-[1.25rem]">

                        {description}

                    </h2>

                ) : null}

            </div>

            <CalendarQuickActions
                className="absolute right-0 top-0 p-[0.75rem]"
                isPrimary={isPrimary}
                onCreateEvent={onCreateEvent}
                onSearchEvents={onSearchEvents}
                onOpenSettings={onOpenSettings}
                onDeleteCalendar={onDeleteCalendar}
                onClearEvents={onClearEvents}
            />

        </div>

        <div className="flex-1 overflow-y-auto pt-[1rem]">{/* messages go here */}</div>

        <div className="pt-[1rem]">

            <div className="relative">

                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value.slice(0, 1000))}
                    maxLength={1000}
                    autoCapitalize="off"
                    spellCheck={false}
                    autoCorrect="off"
                    placeholder="Type instructions…"
                    className="
                    tracking-tighter w-full resize-none
                    rounded-md border border-neutral-700 bg-neutral-800
                    p-3 pr-[3rem] 
                    text-[0.95rem] sm:text-[1rem] leading-[1.25rem]
                    text-asparagus placeholder-broccoli
                    focus:outline-none focus:ring-0
                    "
                    style={{ minHeight: "2.75rem" }} 
                />
                
                <div className={`pointer-events-none absolute bottom-[0.5rem] right-[0.75rem] text-[0.75rem] ${value.length === 1000 ? 'text-red-600' : 'text-neutral-500'}`}>

                    {value.length}/1000

                </div>

            </div>

        </div>

    </div>

  );

}
