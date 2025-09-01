"use client";
import React, { useState, useCallback } from "react";
import PrimaryBadge from "./PrimaryBadge";
import CalendarQuickActions from "./CalendarQuickActions";
import Chatbox from "./ChatBox";
import CreateEventPopup from "./CreateEventPopup";
import SearchEventsPopup from "./SearchEventsPopup";
import DeleteCalendarPopup from "./DeleteCalendarPopup";
import CalendarSettingsPopup from "./CalendarSettingsPopup";
import MessageList from "./MessageList";
import type { ChatMessage } from "./MessageList";
import { useCalendar } from "../contexts/SelectedCalendarContext";
import AttachmentsCard from "./AttachmentsCard";

type TailLinkChatProps = {

    name: string;
    description?: string;
    isPrimary: boolean;
    onCreateEvent?: () => void;
    onSearchEvents?: () => void;
    onOpenSettings?: () => void;
    onDeleteCalendar?: () => void;
    className?: string;

};

type Panel = "create" | "search" | "settings" | "delete" | null;

export default function TailLinkChat({ name, description, isPrimary, className = "" }: TailLinkChatProps) {

  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [messages] = useState<ChatMessage[]>([]);

  const [openPanel, setOpenPanel] = useState<Panel>(null);
  const toggle = (panel: Exclude<Panel, null>) => setOpenPanel((p) => (p === panel ? null : panel));
  const close = () => setOpenPanel(null);
  const { calendar } = useCalendar();

  const handleFilesPicked = () => { }

  const removeAttachment = useCallback((index: number) => {

    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setPendingIds((prev) => prev.filter((_, i) => i !== index));

  }, []);

  return (
    <div className={`relative h-full flex flex-col ${className}`}>

      <div className="flex items-start justify-between">

        <div className="w-fit">

          <div className="flex gap-2 items-center">

            <h1 className="text-lg font-semibold tracking-tight text-asparagus">{name}</h1>

            <PrimaryBadge show={isPrimary} />

          </div>

          {description ? <h2 className="text-sm font-normal tracking-tight text-broccoli">{description}</h2> : null}

        </div>

        <div className="relative">

          <CalendarQuickActions
            className=""
            isPrimary={isPrimary}
            onCreateEvent={() => toggle("create")}
            onSearchEvents={() => toggle("search")}
            onOpenSettings={() => toggle("settings")}
            onDeleteCalendar={() => toggle("delete")}
          />

          {openPanel && (

            <div className="absolute right-0 mt-2 z-50">

              <div className="w-120 rounded-md border border-neutral-800 bg-neutral-900/95 p-4 shadow-xl">

                {openPanel === "create" && <CreateEventPopup onClose={close} />}
                {openPanel === "search" && <SearchEventsPopup onClose={close} />}
                {openPanel === "settings" && <CalendarSettingsPopup calendarId={calendar!.id} onClose={close} />}
                {openPanel === "delete" && <DeleteCalendarPopup onClose={close} />}

              </div>

            </div>

          )}

        </div>

      </div>

      <div className="flex-1 overflow-y-auto pt-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-600">

        <MessageList messages={messages} />

      </div>

      <div>

        <AttachmentsCard items={attachments} onRemove={removeAttachment} />
        <Chatbox onFilesPicked={handleFilesPicked} />
        {isUploading && <div className="mt-1 text-xs text-neutral-400">Uploading…</div>}

      </div>
      
    </div>
  );
}
