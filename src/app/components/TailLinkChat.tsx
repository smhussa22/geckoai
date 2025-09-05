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

type StagedAttachment = {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
};

export default function TailLinkChat({
  name,
  description,
  isPrimary,
  className = "",
}: TailLinkChatProps) {
  const [thinking, setThinking] = useState(false);
  const [defaultTimeZone, setDefaultTimeZone] = useState<string | null>(null);
  const [openPanel, setOpenPanel] = useState<Panel>(null);
  const toggle = (panel: Exclude<Panel, null>) => setOpenPanel((p) => (p === panel ? null : panel));
  const close = () => setOpenPanel(null);
  const { calendar } = useCalendar();

  // Chat messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Local staged attachments (pre-send)
  const [isUploading, setIsUploading] = useState(false);
  const [staged, setStaged] = useState<StagedAttachment[]>([]);

  // Fetch user's default timezone once
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/calendars");
        if (!r.ok) {
          console.warn("[DEBUG] Failed to fetch calendars for timezone:", r.status);
          return;
        }
        const d = await r.json();
        if (d?.defaultTimeZone) {
          setDefaultTimeZone(d.defaultTimeZone);
          console.log("[DEBUG] Set default timezone:", d.defaultTimeZone);
        }
      } catch (error) {
        console.error("[ERROR] Failed to fetch timezone:", error);
      }
    })();
  }, []);

  const loadMessages = useCallback(async () => {
    if (!calendar?.id) return;
    
    console.log("[DEBUG] Loading messages for calendar:", calendar.id);
    
    try {
      const res = await fetch(`/api/chats/${encodeURIComponent(calendar.id)}/messages`, {
        method: "GET",
      });
      
      if (!res.ok) {
        console.error("[ERROR] Failed to load messages:", res.status, await res.text());
        return;
      }
      
      const data = await res.json();
      console.log("[DEBUG] Loaded messages:", data.messages?.length || 0);
      
      const mapped: ChatMessage[] = (data.messages || []).map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
        // normalize to UI Attachment shape expected by your MessageBubble
        attachments: (m.attachments || []).map((a: any) => ({
          id: a.id,
          name: a.filename,
          url: "",
          mime: a.mimeType,
        })),
      }));
      setMessages(mapped);
    } catch (error) {
      console.error("[ERROR] Exception loading messages:", error);
    }
  }, [calendar?.id]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Handle file selection -> upload to /attachments -> stage
  const handleFilesPicked = useCallback(
    async (files: File[]) => {
      if (!calendar?.id || !files?.length) {
        console.log("[DEBUG] File upload skipped - no calendar or files");
        return;
      }
      
      console.log("[DEBUG] Starting file upload:", { 
        calendarId: calendar.id, 
        fileCount: files.length,
        files: files.map(f => ({ name: f.name, size: f.size, type: f.type }))
      });
      
      setIsUploading(true);
      try {
        const fd = new FormData();
        for (const f of files) fd.append("files", f, f.name);
        
        const resp = await fetch(
          `/api/chats/${encodeURIComponent(calendar.id)}/attachments`,
          {
            method: "POST",
            body: fd,
          }
        );
        
        console.log("[DEBUG] File upload response status:", resp.status);
        
        if (!resp.ok) {
          const errorText = await resp.text();
          console.error("[ERROR] File upload failed:", resp.status, errorText);
          return;
        }
        
        const data = await resp.json();
        console.log("[DEBUG] File upload success:", data);
        
        const uploaded: StagedAttachment[] = data.attachments || [];
        setStaged((prev) => [...prev, ...uploaded]);
      } catch (error) {
        console.error("[ERROR] File upload exception:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [calendar?.id]
  );

  // Remove a staged attachment before send
  const removeAttachment = useCallback(
    async (index: number) => {
      const item = staged[index];
      if (!item || !calendar?.id) {
        setStaged((prev) => prev.filter((_, i) => i !== index));
        return;
      }
      
      console.log("[DEBUG] Removing attachment:", item.id);
      
      try {
        const resp = await fetch(
          `/api/chats/${encodeURIComponent(calendar.id)}/attachments?ids=${encodeURIComponent(
            item.id
          )}`,
          { method: "DELETE" }
        );
        
        if (resp.ok) {
          setStaged((prev) => prev.filter((_, i) => i !== index));
          console.log("[DEBUG] Attachment removed successfully");
        } else {
          console.error("[ERROR] Failed to remove attachment:", resp.status, await resp.text());
        }
      } catch (error) {
        console.error("[ERROR] Exception removing attachment:", error);
      }
    },
    [staged, calendar?.id]
  );

  const handleSend = useCallback(
    async (text: string) => {
      if (!calendar?.id || !text.trim()) return;

      console.log("[DEBUG] Starting handleSend with:", { 
        calendarId: calendar.id, 
        text: text.substring(0, 100) + "...",
        stagedAttachments: staged.length
      });

      // optimistic bubble
      const optimistic: ChatMessage = {
        id: `local-${Date.now()}`,
        role: "user",
        content: text.trim(),
        createdAt: new Date().toISOString(),
        attachments: staged.map((a) => ({
          id: a.id,
          name: a.filename,
          url: "",
          mime: a.mimeType,
        })),
      };
      setMessages((prev) => [...prev, optimistic]);
      setThinking(true);

      try {
        console.log("[DEBUG] Sending message to API...");
        
        // Send user message with attachmentIds
        const res = await fetch(`/api/chats/${encodeURIComponent(calendar.id)}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: text.trim(),
            role: "user",
            attachmentIds: staged.map((a) => a.id),
          }),
        });

        console.log("[DEBUG] Messages API response status:", res.status);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("[ERROR] Messages API request failed:", res.status, errorText);
          
          // rollback optimistic and show error
          setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
          setMessages((prev) => [
            ...prev,
            {
              id: `err-${Date.now()}`,
              role: "assistant",
              content: `Error sending message: ${res.status} - ${errorText}`,
              createdAt: new Date().toISOString(),
            },
          ]);
          setThinking(false);
          return;
        }

        // Clear local staged after a successful send
        setStaged([]);

        // Parse response
        let data;
        try {
          data = await res.json();
          console.log("[DEBUG] Messages API response data keys:", Object.keys(data));
        } catch (parseError) {
          console.error("[ERROR] Failed to parse messages API response:", parseError);
          setMessages((prev) => [
            ...prev,
            {
              id: `parse-err-${Date.now()}`,
              role: "assistant",
              content: "Error: Invalid response from server",
              createdAt: new Date().toISOString(),
            },
          ]);
          return;
        }

        // If server returned the pair, merge; otherwise reload
        let assistantText = "";
        const returnsPair = data?.user && data?.assistant;

        if (returnsPair) {
          console.log("[DEBUG] Server returned user/assistant pair");
          
          // Replace optimistic with server truth
          setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));

          const newUser: ChatMessage = {
            id: data.user.id,
            role: data.user.role,
            content: data.user.content,
            createdAt: data.user.createdAt,
            attachments: (data.user.attachments || []).map((a: any) => ({
              id: a.id,
              name: a.filename,
              url: "",
              mime: a.mimeType,
            })),
          };
          const newAssistant: ChatMessage = {
            id: data.assistant.id,
            role: data.assistant.role,
            content: data.assistant.content,
            createdAt: data.assistant.createdAt,
            attachments: (data.assistant.attachments || []).map((a: any) => ({
              id: a.id,
              name: a.filename,
              url: "",
              mime: a.mimeType,
            })),
          };
          setMessages((prev) => [...prev, newUser, newAssistant]);
          assistantText = newAssistant.content ?? "";
        } else {
          console.log("[DEBUG] Server returned single message, reloading...");
          
          // Reload thread
          await loadMessages();
          // Get latest assistant
          const res2 = await fetch(
            `/api/chats/${encodeURIComponent(calendar.id)}/messages`,
            { method: "GET" }
          );
          if (res2.ok) {
            const data2 = await res2.json();
            const mapped: ChatMessage[] = (data2.messages || []).map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              createdAt: m.createdAt,
              attachments: (m.attachments || []).map((a: any) => ({
                id: a.id,
                name: a.filename,
                url: "",
                mime: a.mimeType,
              })),
            }));
            setMessages(mapped);
            const latestAssistant = mapped
              .filter((m) => m.role === "assistant")
              .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
              .pop();
            assistantText = latestAssistant?.content ?? "";
          }
        }

        // 3) If we have assistant text, run AI events executor with timezone
        if (assistantText.trim()) {
          console.log("[DEBUG] Calling AI executor with assistant text length:", assistantText.length);
          console.log("[DEBUG] Using timezone:", defaultTimeZone || "UTC");
          
          const aiRes = await fetch(
            `/api/calendars/${encodeURIComponent(calendar.id)}/events/ai`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                text: assistantText,
                timeZone: defaultTimeZone || undefined,
              }),
            }
          );

          console.log("[DEBUG] AI executor response status:", aiRes.status);

          if (aiRes.ok) {
            let aiData;
            try {
              aiData = await aiRes.json();
              console.log("[DEBUG] AI executor result summary:", {
                created: aiData.result?.created?.length || 0,
                updated: aiData.result?.updated?.length || 0,
                deleted: aiData.result?.deleted?.length || 0,
                errors: aiData.result?.errors?.length || 0,
                planOperations: aiData.plan?.operations?.length || 0
              });
            } catch (parseError) {
              console.error("[ERROR] Failed to parse AI executor response:", parseError);
              setMessages((prev) => [
                ...prev,
                {
                  id: `ai-parse-err-${Date.now()}`,
                  role: "assistant",
                  content: "Error: Invalid AI executor response",
                  createdAt: new Date().toISOString(),
                },
              ]);
              return;
            }

            const { result, plan } = aiData;

            const errs = Array.isArray(result?.errors) ? result.errors : [];
            const summary =
              `Calendar changes — ` +
              `created: ${result?.created?.length ?? 0}, ` +
              `updated: ${result?.updated?.length ?? 0}, ` +
              `deleted: ${result?.deleted?.length ?? 0}` +
              (errs.length ? `, errors: ${errs.length}` : "");

            // Summary bubble
            setMessages((prev) => [
              ...prev,
              {
                id: `ai-summary-${Date.now()}`,
                role: "assistant",
                content: summary,
                createdAt: new Date().toISOString(),
              },
            ]);

            // If planner had zero ops AND no changes, show scoped message
            const ops = Array.isArray(plan?.operations) ? plan.operations.length : 0;
            if ((result?.created?.length ?? 0) + (result?.updated?.length ?? 0) + (result?.deleted?.length ?? 0) === 0 && ops === 0) {
              setMessages((prev) => [
                ...prev,
                {
                  id: `ai-scope-${Date.now()}`,
                  role: "assistant",
                  content:
                    "I can create, edit, and delete **calendar events** for the calendar you're chatting in. " +
                    "I don't have the calendar's name in my responses, but any changes happen here. " +
                    "Please give explicit dates and times (e.g., `July 6, 2025 7:00 PM–9:00 PM`).",
                  createdAt: new Date().toISOString(),
                },
              ]);
            }

            // If there are errors, show details + console log
            if (errs.length) {
              console.groupCollapsed(`[AI Executor] ${errs.length} error(s)`);
              console.table(
                errs.map((e: any) => ({
                  index: e.index,
                  action: e.action,
                  message: e.message,
                }))
              );
              console.log("Full errors:", errs);
              console.groupEnd();

              const visible = errs.slice(0, 5);
              const pretty =
                "```\n" + JSON.stringify(visible, null, 2) + "\n```" +
                (errs.length > 5 ? `\n(+${errs.length - 5} more…)` : "");

              setMessages((prev) => [
                ...prev,
                {
                  id: `ai-errors-${Date.now()}`,
                  role: "assistant",
                  content: `I hit some issues applying changes. Here are the details:\n\n${pretty}`,
                  createdAt: new Date().toISOString(),
                },
              ]);
            }
          } else {
            const errorText = await aiRes.text();
            console.error("[ERROR] AI executor failed:", aiRes.status, errorText);
            
            setMessages((prev) => [
              ...prev,
              {
                id: `aierr-${Date.now()}`,
                role: "assistant",
                content: `AI Executor Error: ${aiRes.status} - ${errorText}`,
                createdAt: new Date().toISOString(),
              },
            ]);
          }
        } else {
          console.log("[DEBUG] No assistant text to process with AI executor");
        }
      } catch (error: any) {
        console.error("[ERROR] handleSend failed:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: `fatal-err-${Date.now()}`,
            role: "assistant",
            content: `Fatal error: ${error.message || "Unknown error"}`,
            createdAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setThinking(false);
      }
    },
    [calendar?.id, defaultTimeZone, loadMessages, staged]
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
        {/* Show staged (pre-send) files */}
        <AttachmentsCard
          items={staged.map((s) => s.filename)}
          onRemove={removeAttachment}
        />

        <Chatbox onFilesPicked={handleFilesPicked} onSend={handleSend} />

        {isUploading && <div className="mt-1 text-xs text-neutral-400">Uploading…</div>}
      </div>
    </div>
  );
}