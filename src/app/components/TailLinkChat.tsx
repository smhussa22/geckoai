"use client";
import React, { useState } from "react";
import PrimaryBadge from "./PrimaryBadge";
import CalendarQuickActions from "./CalendarQuickActions";
import Chatbox from "./ChatBox";
import CreateEventPopup from "./CreateEventPopup";
import SearchEventsPopup from "./SearchEventsPopup";
import ClearEventsPopup from "./ClearEventsPopup";
import DeleteCalendarPopup from "./DeleteCalendarPopup";
import CalendarSettingsPopup from "./CalendarSettingsPopup";

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

type Panel = | "create" | "search" | "settings" | "delete" | "clear" | null;

export default function TailLinkChat({ name = "Calendar Name", description = "There are fifty characters in this large sentence.", isPrimary, className = "" }: TailLinkChatProps) {

    isPrimary = true;
    const [openPanel, setOpenPanel] = useState<Panel>(null);
    const toggle = (panel: Exclude<Panel, null>) => setOpenPanel((currentPanel) =>  currentPanel === panel ? null : panel );
    const close = () => setOpenPanel(null);

    return (

        <div className={`relative h-full flex flex-col ${className}`}>

            <div className="flex items-start justify-between gap-4">

                <div className="w-fit">

                    <div className="flex items-center gap-2">
                    
                        <h1 className="tracking-tighter font-semibold text-asparagus text-2xl"> {name} </h1>
                        <PrimaryBadge show={isPrimary} />

                    </div>

                    {description ? ( <h2 className="tracking-tighter text-broccoli text-xl"> {description} </h2> ) : null}

                </div>

                <div className="relative">

                    <CalendarQuickActions
                    className=""
                    isPrimary={isPrimary}
                    onCreateEvent={() => toggle("create")}
                    onSearchEvents={() => toggle("search")}
                    onOpenSettings={() => toggle("settings")}
                    onDeleteCalendar={() => toggle("delete")}
                    onClearEvents={() => toggle("clear")}
                    />

                    {openPanel && (

                        <div className="mt-2 w-full max-w-3xl rounded-md border border-neutral-800 bg-neutral-900/90 p-4 shadow-xl">

                            {openPanel === "create" && ( <CreateEventPopup onClose={close} />)}
                            {openPanel === "search" && ( <SearchEventsPopup onClose={close} />)}
                            {openPanel === "settings" && ( <CalendarSettingsPopup onClose={close} />)}
                            {openPanel === "delete" && ( <DeleteCalendarPopup onClose={close} />)}
                            {openPanel === "clear" && ( <ClearEventsPopup onClose={close} />)}

                        </div>

                    )}

                </div>
                
            </div>

            <div className="flex-1 overflow-y-auto pt-2"> {/* message */} </div>

            <div> <Chatbox /> </div>

        </div>

    );
}
