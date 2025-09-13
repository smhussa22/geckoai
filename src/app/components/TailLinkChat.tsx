'use client';
import React, { useEffect, useState, useRef } from 'react';
import PrimaryBadge from './PrimaryBadge';
import CalendarQuickActions from './CalendarQuickActions';
import Chatbox from './ChatBox';
import CreateEventPopup from './CreateEventPopup';
import SearchEventsPopup from './SearchEventsPopup';
import DeleteCalendarPopup from './DeleteCalendarPopup';
import ClearChatPopup from './ClearChatPopup';
import CalendarSettingsPopup from './CalendarSettingsPopup';
import MessageList from './MessageList';
import type { ChatMessage } from './MessageList';
import { useCalendar } from '../contexts/SelectedCalendarContext';
import AttachmentsCard from './AttachmentsCard';
import AIChatLoading from './AIChatLoading';
import ViewToggle, { type ViewMode } from './ViewToggle';

type TailLinkChatProps = {
  name: string;
  description?: string;
  isPrimary: boolean;
  view: ViewMode;
  onChangeView: (view: ViewMode) => void;
};

type Panel = 'create' | 'search' | 'settings' | 'delete' | 'clear' | null;

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
  const [isUploading, setIsUploading] = useState(false);

  const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  };

  useEffect(() => {
    if (pinnedToBottom) scrollToBottom('smooth');
  }, [messages.length, thinking]);

  useEffect(() => {
    scrollToBottom();
  }, []);

  const handleFilesPicked = async (files: File[]) => {
    if (!calendar || files.length === 0) return;

    setIsUploading(true);

    try {
      const uploaded: StagedAttachment[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`/api/chats/${encodeURIComponent(calendar.id)}/attachments`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || 'Upload failed');

        uploaded.push({
          id: data.tempId,
          filename: data.filename,
          mimeType: data.mimeType,
          size: data.size,
          s3Key: data.s3Key,
        });
      }

      setStaged((prev) => [...prev, ...uploaded]);
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = async (index: number) => {
    if (!calendar) return;
    const item = staged[index];
    if (!item) return;

    await fetch(
      `/api/chats/${encodeURIComponent(calendar.id)}/attachments/${encodeURIComponent(item.id)}?filename=${encodeURIComponent(item.filename)}`,

      { method: 'DELETE' },
    );

    setStaged((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async (text: string) => {
    if (!calendar) return;


    const now = new Date().toISOString();
    const tempUserId = crypto.randomUUID();
    const optimisticUser: ChatMessage = {
      id: tempUserId,
      role: 'user',
      content: text,
      createdAt: now,
      attachments: staged.map((s) => ({
        id: s.id,
        name: s.filename,
        url: `/api/chats/${encodeURIComponent(calendar.id)}/attachments/${encodeURIComponent(s.id)}?filename=${encodeURIComponent(s.filename)}`,
      })),
    };
    setMessages((prev) => [...prev, optimisticUser]);


    setThinking(true);


    const stagedForApi = staged.map((s) => ({
      tempId: s.id,
      fileName: s.filename,
      mimeType: s.mimeType,
      size: s.size,
      s3Key: s.s3Key,
    }));
    setStaged([]);

    try {

      const res = await fetch(`/api/chats/${encodeURIComponent(calendar.id)}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, staged: stagedForApi }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Send failed');

      const list = await fetch(`/api/chats/${encodeURIComponent(calendar.id)}/messages?take=100`, {
        cache: 'no-store',
      });
      if (list.ok) {
        const json = await list.json();
        if (Array.isArray(json.messages)) setMessages(json.messages);
      } else {
        console.warn('Refresh failed:', list.status, await list.text());
      }
    } catch (err) {
      console.error(err);

      setMessages((prev) => prev.filter((m) => m.id !== tempUserId));

      setStaged((prev) => (prev.length ? prev : staged));
    } finally {
      setThinking(false);
    }
  };

  const refreshMessages = async (take = 100) => {
    if (!calendar) return;
    const url = `/api/chats/${encodeURIComponent(calendar.id)}/messages?take=${take}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      console.warn('Initial fetch failed:', res.status, await res.text());
      return;
    }
    const data = await res.json();
    if (Array.isArray(data.messages)) setMessages(data.messages);
  };

  useEffect(() => {
    refreshMessages(100);
  }, [calendar?.id]);
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className="relative flex h-full flex-col"
    >
      <div className="mb-1 flex items-center justify-between rounded-md border border-neutral-700 shadow-md">
        <div className="flex items-center gap-4 px-2">
          <div className="p-2">
            <div className="flex items-center gap-2">
              <h1 className="text-asparagus text-xl font-bold tracking-tighter">{name}</h1>
              <PrimaryBadge size={20} show={isPrimary} className="mt-0.5" />
            </div>
            {description ? (
              <h2 className="text-broccoli font-semibold tracking-tighter">{description}</h2>
            ) : null}
          </div>
          <ViewToggle view={view} onChange={onChangeView} className="shrink-0" />
        </div>

        <div className="relative my-2 mr-2 flex items-center">
          <CalendarQuickActions
            isPrimary={isPrimary}
            onCreateEvent={() => toggle('create')}
            onSearchEvents={() => toggle('search')}
            onOpenSettings={() => toggle('settings')}
            onDeleteCalendar={() => toggle('delete')}
            onClearChat={() => toggle('clear')}
          />

          {openPanel && (
            <div className="absolute top-full right-0 z-50 mt-2">
              <div className="w-120 rounded-md border border-neutral-800 bg-neutral-900/95 p-4 shadow-xl">
                {openPanel === 'create' && <CreateEventPopup onClose={close} />}
                {openPanel === 'search' && <SearchEventsPopup onClose={close} />}
                {openPanel === 'settings' && (
                  <CalendarSettingsPopup calendarId={calendar!.id} onClose={close} />
                )}
                {openPanel === 'delete' && <DeleteCalendarPopup onClose={close} />}
                {openPanel === 'clear' && (
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

      <div
        ref={scrollerRef}
        className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-600 flex-1 overflow-y-auto pt-2"
      >
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
