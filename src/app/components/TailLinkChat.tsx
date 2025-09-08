"use client";
import React, { useEffect, useState, useRef } from "react";
import PrimaryBadge from "./PrimaryBadge";
import CalendarQuickActions from "./CalendarQuickActions";
import Chatbox from "./ChatBox";
import CreateEventPopup from "./CreateEventPopup";
import SearchEventsPopup from "./SearchEventsPopup";
import DeleteCalendarPopup from "./DeleteCalendarPopup";
import ClearChatPopup from "./ClearChatPopup";
import CalendarSettingsPopup from "./CalendarSettingsPopup";
import MessageList from "./MessageList";
import type { ChatMessage } from "./MessageList";
import { useCalendar } from "../contexts/SelectedCalendarContext";
import AttachmentsCard from "./AttachmentsCard";
import AIChatLoading from "./AIChatLoading";
import DragActive from "./DragActive";
import ViewToggle, { type ViewMode } from "./ViewToggle";

type TailLinkChatProps = {
  name: string;
  description?: string;
  isPrimary: boolean;
  view: ViewMode;
  onChangeView: (view: ViewMode) => void;
};

type Panel = "create" | "search" | "settings" | "delete" | "clear" | null;

type StagedAttachment = {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  s3Key: string;
};

export default function TailLinkChat({
  name,
  description,
  isPrimary,
  view,
  onChangeView,
}: TailLinkChatProps) {
  const [thinking, setThinking] = useState(false);
  const [openPanel, setOpenPanel] = useState<Panel>(null);
  const toggle = (panel: Exclude<Panel, null>) => setOpenPanel((p) => (p === panel ? null : panel));
  const close = () => setOpenPanel(null);
  const { calendar } = useCalendar();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [staged, setStaged] = useState<StagedAttachment[]>([]);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [pinnedToBottom, setPinnedToBottom] = useState(true);

  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  };

  useEffect(() => {
    if (pinnedToBottom) scrollToBottom("smooth");
  }, [messages.length, thinking]);

  useEffect(() => {
    scrollToBottom();
  }, []);

  const handleFilesPicked = async (files: File[]) => {};
  const removeAttachment = async (index: number) => {};
  const handleSend = async (text: string) => {};
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); };

  return (
    <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} className="relative h-full flex flex-col">
      <div className="flex items-center justify-between border rounded-md mb-1 shadow-md border-neutral-700">
        <div className="flex items-center gap-4 px-2">
          <div className="p-2">
            <div className="flex gap-2 items-center">
              <h1 className="text-xl font-bold tracking-tighter text-asparagus">{name}</h1>
              <PrimaryBadge size={20} show={isPrimary} className="mt-0.5" />
            </div>
            {description ? <h2 className="font-semibold tracking-tighter text-broccoli">{description}</h2> : null}
          </div>
          <ViewToggle view={view} onChange={onChangeView} className="shrink-0" />
        </div>

        <div className="relative flex items-center my-2 mr-2">
          <CalendarQuickActions
            isPrimary={isPrimary}
            onCreateEvent={() => toggle("create")}
            onSearchEvents={() => toggle("search")}
            onOpenSettings={() => toggle("settings")}
            onDeleteCalendar={() => toggle("delete")}
            onClearChat={() => toggle("clear")}
          />

          {openPanel && (
            <div className="absolute top-full right-0 mt-2 z-50">
              <div className="w-120 rounded-md border border-neutral-800 bg-neutral-900/95 p-4 shadow-xl">
                {openPanel === "create" && <CreateEventPopup onClose={close} />}
                {openPanel === "search" && <SearchEventsPopup onClose={close} />}
                {openPanel === "settings" && <CalendarSettingsPopup calendarId={calendar!.id} onClose={close} />}
                {openPanel === "delete" && <DeleteCalendarPopup onClose={close} />}
                {openPanel === "clear" && (
                  <ClearChatPopup
                    onClose={close}
                    onCleared={() => {
                      setMessages([]);
                      setStaged([]);
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div ref={scrollerRef} className="flex-1 overflow-y-auto pt-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-600">
        <MessageList messages={messages} />
        {thinking && <AIChatLoading />}
      </div>

      <div>
        <AttachmentsCard items={staged.map((s) => s.filename)} onRemove={removeAttachment} />
        <Chatbox onFilesPicked={handleFilesPicked} onSend={handleSend} />
      </div>
    </div>
  );
}
