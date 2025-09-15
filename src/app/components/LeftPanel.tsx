"use client";
import React from "react";
import { useState, useRef } from "react";
import { LuCalendarPlus } from "react-icons/lu";
import CalendarList from "./CalendarList";
import PopUp from "./Popup";
import CreateCalendarPage from "./CreateCalendarPopup";
import { Tooltip } from "react-tooltip";
// @todo: make page refresh after calendar token expries

export default function LeftPanel() {
    const [isOpen, toggleIsOpen] = useState(false);
    const popupRef = useRef<HTMLDivElement | null>(null);

    const handleClosePopup = () => {
        toggleIsOpen(false);
    };

    return (
        <>
            <div className="flex h-full flex-col gap-1 rounded-md border border-neutral-800 p-2 shadow-md">
                <div className="relative flex flex-row items-center">
                    <h1 className="text-asparagus text-2xl font-bold tracking-tighter">
                        Calendars
                    </h1>

                    <button
                        data-tooltip-id="Create New Calendar"
                        data-tooltip-content={"Create New Calendar"}
                        onClick={() => toggleIsOpen(!isOpen)}
                        className="text-asparagus hover:text-broccoli hover:bgabsolute absolute right-0 rounded-md transition-all"
                    >
                        <LuCalendarPlus size={25} />
                    </button>
                </div>

                <CalendarList />
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 z-70 flex items-center justify-center"
                    onClick={handleClosePopup}
                >
                    <PopUp
                        className="flex flex-col gap-4 shadow-lg"
                        onClose={handleClosePopup}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <CreateCalendarPage onClose={handleClosePopup} />
                    </PopUp>
                </div>
            )}

            <Tooltip
                id="Create New Calendar"
                place="right"
                opacity={1}
                style={{
                    marginLeft: "0.5rem",
                    backgroundColor: "#262626",
                    padding: "0.4rem",
                    borderRadius: "0.375rem",
                    transition: "color 0.3s",
                    letterSpacing: "-0.05em",
                    zIndex: 50,
                    color: "#698f3f",
                }}
                noArrow
                delayShow={0}
                delayHide={0}
            />
        </>
    );
}
