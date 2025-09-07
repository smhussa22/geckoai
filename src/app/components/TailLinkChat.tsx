"use client";
import React, { useEffect, useState, useCallback } from "react";
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

type Panel = "create" | "search" | "settings" | "delete" | "clear" | null;

type StagedAttachment = {

  id: string;
  filename: string;
  mimeType: string;
  size: number;
  s3Key: string;

};

export default function TailLinkChat({ name, description, isPrimary, className = ""}: TailLinkChatProps) {

  const [thinking, setThinking] = useState(false);
  const [defaultTimeZone, setDefaultTimeZone] = useState<string | null>(null);
  const [openPanel, setOpenPanel] = useState<Panel>(null);
  const toggle = (panel: Exclude<Panel, null>) => setOpenPanel((p) => (p === panel ? null : panel));
  const close = () => setOpenPanel(null);
  const { calendar } = useCalendar();
  const [dragActive, setDragActive] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [staged, setStaged] = useState<StagedAttachment[]>([]);

  const handleFilesPicked = async (files: File[]) => {

    if (!calendar || files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      
      const uploaded: StagedAttachment[] = [];
      
      for (const file of files) {

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`/api/chats/${encodeURIComponent(calendar.id)}/attachments`, {

          method: "POST",
          body: formData,

        });

        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || "Upload failed");

        uploaded.push({

          id: data.tempId,
          filename: data.filename,
          mimeType: data.mimeType,
          size: data.size,
          s3Key: data.s3Key,

        });

      }

      setStaged(prev => [...prev, ...uploaded]);

    } 
    finally {

      setIsUploading(false);

    }

  };

  const removeAttachment = async (index: number) => {
  
    if (!calendar) return;
    const item = staged[index];
    if (!item) return;

    await fetch(`/api/chats/${encodeURIComponent(calendar.id)}/attachments/${encodeURIComponent(item.id)}?filename=${encodeURIComponent(item.filename)}`,
    
      { method: "DELETE" }
  
    );

    setStaged(prev => prev.filter((_, i) => i !== index));

  };

  const handleSend = async (text: string) => {

    if (!calendar) return;
    setThinking(true);

    try {

      const stagedForApi = staged.map(staged => ({

        tempId: staged.id,
        fileName: staged.filename,
        mimeType: staged.mimeType,
        size: staged.size,
        s3Key: staged.s3Key,

      }));

      const response = await fetch(`/api/chats/${encodeURIComponent(calendar.id)}/messages`, {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, staged: stagedForApi }),

      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Send failed");

      const list = await fetch(`/api/chats/${encodeURIComponent(calendar.id)}/messages/list?take=100`, { cache: "no-store" });
      
      if (list.ok) {

        const json = await list.json();
        if (Array.isArray(json.messages)) setMessages(json.messages);

      }
      setStaged([]);

    } 
    catch (error) {

      console.error(error);

    } 
    finally {

      setThinking(false);

    }

  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
  
    e.preventDefault();
    if (!dragActive) setDragActive(true);
  
  };
  
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
  
    e.preventDefault();
    setDragActive(false);
  
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
  
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) handleFilesPicked(files);
  
  };

  useEffect(() => {

    (async () => {

      try {

        const response = await fetch("/api/calendars");

        if (!response.ok) {

          console.warn( "[DEBUG] Failed to fetch calendars for timezone:", response.status );
          return;

        }
        const data = await response.json();

        if (data?.defaultTimeZone) {

          setDefaultTimeZone(data.defaultTimeZone);
          console.log("[DEBUG] Set default timezone:", data.defaultTimeZone);

        }

      } catch (error) {

        console.error("[ERROR] Failed to fetch timezone:", error);

      }

    })();

  }, []);

  useEffect(() => { 

    (async () => { 

      if (!calendar?.id) return; 

      try { 

        const response = await fetch(`/api/chats/${encodeURIComponent(calendar.id)}/messages/list?take=100`, { cache: "no-store" }); 
        if (!response.ok) return; 

        const data = await response.json(); 
        if (Array.isArray(data.messages)) setMessages(data.messages); 

      } 
      catch (error) { 

        console.error(error); 

      } 

    })(); 

  }, [calendar?.id]);

  return (

    <>

      <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} className={`relative h-full flex flex-col`}>

        {dragActive && <DragActive/>}

        <div className="flex items-start justify-between">

          <div className="w-fit border p-2 rounded-lg shadow-md border-neutral-700">

            <div className="flex gap-2 items-center">

              <h1 className="text-xl font-bold tracking-tighter text-asparagus">

                {name}

              </h1>

              <PrimaryBadge show={isPrimary} className="mt-0.5" />

            </div>

            {description ? (

              <h2 className="font-semibold tracking-tighter text-broccoli">

                {description}

              </h2>

            ) : null}

          </div>

          <div className="relative">

            <CalendarQuickActions
              className=""
              isPrimary={isPrimary}
              onCreateEvent={() => toggle("create")}
              onSearchEvents={() => toggle("search")}
              onOpenSettings={() => toggle("settings")}
              onDeleteCalendar={() => toggle("delete")}
              onClearChat={() => toggle("clear")}
            />

            {openPanel && (

              <div className="absolute right-0 mt-2 z-50">

                <div className="w-120 rounded-md border border-neutral-800 bg-neutral-900/95 p-4 shadow-xl">

                  {openPanel === "create" && <CreateEventPopup onClose={close} />}
                  {openPanel === "search" && <SearchEventsPopup onClose={close} />}
                  {openPanel === "settings" && (<CalendarSettingsPopup calendarId={calendar!.id} onClose={close}/> )}
                  {openPanel === "delete" && ( <DeleteCalendarPopup onClose={close} />)}
                  {openPanel === "clear" && ( 
                    
                    <ClearChatPopup onClose={() => { setMessages([]); setStaged([]); close(); }} /> 
                    
                  )}

                </div>

              </div>

            )}

          </div>

        </div>

        <div className="flex-1 overflow-y-auto pt-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-600">

          <MessageList messages={messages} />

          {thinking && (

            <div className="mt-2">

              <AIChatLoading />

            </div>

          )}

        </div>

        <div>

          <AttachmentsCard items={staged.map((s) => s.filename)} onRemove={removeAttachment}/>
          <Chatbox onFilesPicked={handleFilesPicked} onSend={handleSend} />

        </div>

      </div>
    
    </>

  );

}
