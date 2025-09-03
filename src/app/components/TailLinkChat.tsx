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

export default function TailLinkChat({
  name,
  description,
  isPrimary,
  className = "",
}: TailLinkChatProps) {
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const [defaultTimeZone, setDefaultTimeZone] = useState<string | null>(null);

  const [openPanel, setOpenPanel] = useState<Panel>(null);
  const toggle = (panel: Exclude<Panel, null>) => setOpenPanel((p) => (p === panel ? null : panel));
  const close = () => setOpenPanel(null);
  const { calendar } = useCalendar();

  // Fetch user's default timezone once
  useEffect(() => {
    (async () => {
      const r = await fetch("/api/calendars");
      if (!r.ok) return;
      const d = await r.json().catch(() => null);
      if (d?.defaultTimeZone) setDefaultTimeZone(d.defaultTimeZone);
    })();
  }, []);

  const loadMessages = useCallback(async () => {
    if (!calendar?.id) return;
    const res = await fetch(`/api/chats/${encodeURIComponent(calendar.id)}/messages`, {
      method: "GET",
    });
    if (!res.ok) return;
    const data = (await res.json()) as {
      messages: {
        id: string;
        role: "user" | "assistant";
        content: string;
        createdAt: string;
        attachments?: any[];
      }[];
    };
    const mapped: ChatMessage[] = data.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
      attachments: m.attachments as any,
    }));
    setMessages(mapped);
  }, [calendar?.id]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleFilesPicked = () => {};

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setPendingIds((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSend = useCallback(
    async (text: string) => {
      if (!calendar?.id || !text.trim()) return;

      // optimistic user bubble
      const optimistic: ChatMessage = {
        id: `local-${Date.now()}`,
        role: "user",
        content: text.trim(),
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);
      setThinking(true);

      try {
        // 1) Send user message
        const res = await fetch(`/api/chats/${encodeURIComponent(calendar.id)}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text.trim(), role: "user" }),
        });

        if (!res.ok) {
          // roll back and show error bubble
          setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
          setMessages((prev) => [
            ...prev,
            {
              id: `err-${Date.now()}`,
              role: "assistant",
              content: "Sorry, I couldn't send that. Please try again.",
              createdAt: new Date().toISOString(),
            },
          ]);
          setThinking(false);
          return;
        }

        // 2) Replace optimistic with server truth (if returned), otherwise reload thread
        let assistantText = "";

        const data = await res.json().catch(() => ({} as any));
        const returnsPair = data?.user && data?.assistant;

        if (returnsPair) {
          // Replace optimistic
          setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
          const newUser: ChatMessage = {
            id: data.user.id,
            role: data.user.role,
            content: data.user.content,
            createdAt: data.user.createdAt,
            attachments: data.user.attachments,
          };
          const newAssistant: ChatMessage = {
            id: data.assistant.id,
            role: data.assistant.role,
            content: data.assistant.content,
            createdAt: data.assistant.createdAt,
            attachments: data.assistant.attachments,
          };
          setMessages((prev) => [...prev, newUser, newAssistant]);
          assistantText = newAssistant.content ?? "";
        } else {
          // Reload full thread to capture any assistant message created server-side
          await loadMessages();
          // Find the newest assistant message
          const latestAssistant = (await (async () => {
            const res2 = await fetch(
              `/api/chats/${encodeURIComponent(calendar.id)}/messages`,
              { method: "GET" }
            );
            if (!res2.ok) return null;
            const data2 = await res2.json();
            const mapped: ChatMessage[] = (data2.messages || []).map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              createdAt: m.createdAt,
              attachments: m.attachments,
            }));
            // ensure UI reflects latest
            setMessages(mapped);
            return mapped
              .filter((m) => m.role === "assistant")
              .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
              .pop();
          })());
          assistantText = latestAssistant?.content ?? "";
        }

        // 3) If we have assistant text, run AI events executor with timezone
        if (assistantText.trim()) {
          const aiRes = await fetch(
            `/api/calendars/${encodeURIComponent(calendar.id)}/events/ai`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                text: assistantText,
                timeZone: defaultTimeZone || undefined, // e.g., "America/Toronto"
              }),
            }
          );

          if (aiRes.ok) {
            const { result } = await aiRes.json().catch(() => ({}));
            if (result) {
              const summary =
                `Calendar changes — ` +
                `created: ${result.created?.length ?? 0}, ` +
                `updated: ${result.updated?.length ?? 0}, ` +
                `deleted: ${result.deleted?.length ?? 0}` +
                (result.errors?.length ? `, errors: ${result.errors.length}` : "");
              setMessages((prev) => [
                ...prev,
                {
                  id: `ai-summary-${Date.now()}`,
                  role: "assistant",
                  content: summary,
                  createdAt: new Date().toISOString(),
                },
              ]);
            }
          } else {
            setMessages((prev) => [
              ...prev,
              {
                id: `aierr-${Date.now()}`,
                role: "assistant",
                content: "I couldn't apply calendar changes right now.",
                createdAt: new Date().toISOString(),
              },
            ]);
          }
        }
      } finally {
        setThinking(false);
      }
    },
    [calendar?.id, defaultTimeZone, loadMessages]
  );

  return (
    <div className={`relative h-full flex flex-col ${className}`}>
      <div className="flex items-start justify-between">
        <div className="w-fit border p-2 rounded-lg shadow-md border-neutral-700">
          <div className="flex gap-2 items-center">
            <h1 className="text-xl font-bold tracking-tighter text-asparagus">{name}</h1>
            <PrimaryBadge show={isPrimary} className="mt-0.5" />
          </div>
          {description ? (
            <h2 className="font-semibold tracking-tighter text-broccoli">{description}</h2>
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
                {openPanel === "settings" && (
                  <CalendarSettingsPopup calendarId={calendar!.id} onClose={close} />
                )}
                {openPanel === "delete" && <DeleteCalendarPopup onClose={close} />}
                {openPanel === "clear" && <ClearChatPopup onClose={close} />}
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
        <AttachmentsCard items={attachments} onRemove={removeAttachment} />
        <Chatbox onFilesPicked={handleFilesPicked} onSend={handleSend} />
        {isUploading && <div className="mt-1 text-xs text-neutral-400">Uploading…</div>}
      </div>
    </div>
  );
}
