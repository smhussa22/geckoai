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
import ViewToggle, { type ViewMode } from "./ViewToggle";
import DragActive from "./DragActive";
import PopupOverlay from "./PopupOverlay";

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
    parsed?: { kind: string; pageCount?: number; slideCount?: number; preview?: string };
};

const acceptableFiles = new Set([".pdf", ".txt", ".png", ".jpg", ".jpeg", ".webp", ".pptx"]);
const maxFileSizeInBytes = 50 * 1024 * 1024;
const maxFilesPerMessage = 5;

const extensionOf = (n: string) =>
    n.lastIndexOf(".") >= 0 ? n.slice(n.lastIndexOf(".")).toLowerCase() : "";
const fmtMB = (b: number) => (b / 1048576).toFixed(1);

export default function TailLinkChat({
    name,
    description,
    isPrimary,
    view,
    onChangeView,
}: TailLinkChatProps) {
    const [thinking, setThinking] = useState(false);
    const [openPanel, setOpenPanel] = useState<Panel>(null);
    const toggle = (panel: Exclude<Panel, null>) =>
        setOpenPanel((p) => (p === panel ? null : panel));
    const close = () => setOpenPanel(null);
    const { calendar } = useCalendar();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const scrollerRef = useRef<HTMLDivElement | null>(null);
    const [pinnedToBottom, setPinnedToBottom] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
    const [dragDepth, setDragDepth] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const stagedMapRef = useRef<Map<string, StagedAttachment[]>>(new Map());
    const [staged, setStaged] = useState<StagedAttachment[]>([]);
    const chatId = calendar?.id ?? "";

    useEffect(() => {
        if (!chatId) {
            setStaged([]);
            return;
        }
        setStaged(stagedMapRef.current.get(chatId) ?? []);
    }, [chatId]);

    const saveStagedForChat = (
        next: StagedAttachment[] | ((prev: StagedAttachment[]) => StagedAttachment[])
    ) => {
        setStaged((prevState) => {
            const nextState = typeof next === "function" ? (next as any)(prevState) : next;
            if (chatId) stagedMapRef.current.set(chatId, nextState);
            return nextState;
        });
    };

    const remainingSlots = Math.max(0, maxFilesPerMessage - staged.length);

    const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
        const el = scrollerRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior });
    };

    const requestAnimationFrameScroll = (behavior: ScrollBehavior = "auto") => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => scrollToBottom(behavior));
        });
    };

    const onScroll = () => {
        const container = scrollerRef.current;
        if (!container) return;
        const threshold = 8;
        const atBottom =
            container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
        setPinnedToBottom(atBottom);
    };

    useEffect(() => {
        if (pinnedToBottom) requestAnimationFrameScroll("smooth");
    }, [messages.length, thinking, pinnedToBottom]);

    useEffect(() => {
        requestAnimationFrameScroll("auto");
    }, []);

    const handleFilesPicked = async (files: File[]) => {
        console.log("[TailLinkChat] handleFilesPicked called with:", files);
        if (!calendar) return;
        if (files.length === 0) console.warn("[TailLinkChat] No files received");

        setIsUploading(true);
        try {
            const uploaded: StagedAttachment[] = [];
            const stagedFiles = files.slice(0, Math.max(0, maxFilesPerMessage - staged.length));

            console.log("[TailLinkChat] Uploading staged files:", stagedFiles);

            for (const file of stagedFiles) {
                console.log("[TailLinkChat] Uploading to API:", file.name, file.size, file.type);

                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch(
                    `/api/chats/${encodeURIComponent(calendar.id)}/attachments`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                console.log("[TailLinkChat] API response status:", response.status);

                const data = await response.json();

                console.log("[TailLinkChat] API response data:", data);

                if (!response.ok) throw new Error(data?.error || "Upload failed");

                uploaded.push({
                    id: data.tempId,
                    filename: data.fileName ?? data.filename,
                    mimeType: data.mimeType,
                    size: data.size,
                    s3Key: data.s3Key,
                    parsed: data.parsed || undefined,
                });

                console.log("[TailLinkChat] Uploaded attachments:", uploaded);
            }

            saveStagedForChat((prev) => [...prev, ...uploaded]);
            if (files.length > stagedFiles.length) {
                setToastMsg(
                    "You can attach at most 5 files per message. Extra files were skipped."
                );
            }

            if (pinnedToBottom) requestAnimationFrameScroll("smooth");
        } catch (error: any) {
            console.error("[TailLinkChat] Upload error:", error);
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
            { method: "DELETE" }
        );

        saveStagedForChat((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSend = async (text: string) => {
        if (!calendar) return;

        const now = new Date().toISOString();
        const tempUserId = crypto.randomUUID();
        const optimisticUser: ChatMessage = {
            id: tempUserId,
            role: "user",
            content: text,
            createdAt: now,
            attachments: staged.map((s) => ({
                id: s.id,
                name: s.filename,
                url: `/api/chats/${encodeURIComponent(calendar.id)}/attachments/${encodeURIComponent(s.id)}?filename=${encodeURIComponent(s.filename)}`,
            })),
        };
        setMessages((prev) => [...prev, optimisticUser]);

        if (pinnedToBottom) requestAnimationFrameScroll("smooth");

        setThinking(true);

        const stagedForApi = staged.map((s) => ({
            tempId: s.id,
            fileName: s.filename,
            mimeType: s.mimeType,
            size: s.size,
            s3Key: s.s3Key,
            parsed: s.parsed,
        }));

        saveStagedForChat([]);

        try {
            const response = await fetch(`/api/chats/${encodeURIComponent(calendar.id)}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, staged: stagedForApi }),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data?.error || "Send failed");

            const list = await fetch(
                `/api/chats/${encodeURIComponent(calendar.id)}/messages?take=100`,
                {
                    cache: "no-store",
                }
            );
            if (list.ok) {
                const json = await list.json();
                if (Array.isArray(json.messages)) setMessages(json.messages);
            } else {
                console.warn("Refresh failed:", list.status, await list.text());
            }
        } catch (error: any) {
            console.error(error);
            setMessages((prev) => prev.filter((message) => message.id !== tempUserId));

            saveStagedForChat(stagedForApi as any);
        } finally {
            setThinking(false);
            if (pinnedToBottom) requestAnimationFrameScroll("smooth");
        }
    };

    const refreshMessages = async (take = 100) => {
        if (!calendar) return;
        const url = `/api/chats/${encodeURIComponent(calendar.id)}/messages?take=${take}`;
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
            console.warn("Initial fetch failed:", response.status, await response.text());
            return;
        }
        const data = await response.json();
        if (Array.isArray(data.messages)) setMessages(data.messages);
    };

    useEffect(() => {
        let active = true;
        const run = async () => {
            if (!calendar?.id) return;
            setLoadingChat(true);
            await refreshMessages(100);
            if (active) {
                setLoadingChat(false);
                requestAnimationFrameScroll("auto");
            }
        };
        run();
        return () => {
            active = false;
        };
    }, [calendar?.id]);

    const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragDepth((d) => d + 1);
        setIsDragging(true);
    };

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
    };

    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragDepth((d) => {
            const next = Math.max(0, d - 1);
            if (next === 0) setIsDragging(false);
            return next;
        });
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragDepth(0);
        setIsDragging(false);

        const files = Array.from(e.dataTransfer?.files || []);
        if (!files.length) return;

        const accepted: File[] = [];
        const rejected: string[] = [];

        const remaining = Math.max(0, maxFilesPerMessage - staged.length);
        if (remaining === 0) {
            setToastMsg("Attachment limit reached (5). Remove a file to add another.");
            return;
        }

        for (const file of files) {
            console.log("[Parent] Uploading file:", file.name, file.size, file.type);
            const extension = extensionOf(file.name);
            if (!acceptableFiles.has(extension)) {
                rejected.push(`${file.name} — unsupported ${extension || "(none)"}`);
            } else if (file.size > maxFileSizeInBytes) {
                rejected.push(`${file.name} — too large (${fmtMB(file.size)} MB)`);
            } else if (accepted.length < remaining) {
                accepted.push(file);
            } else {
                rejected.push(`${file.name} — limit reached (max ${maxFilesPerMessage})`);
            }
        }

        if (rejected.length) {
            const msg =
                `Skipped ${rejected.length} file${rejected.length > 1 ? "s" : ""}:\n` +
                rejected.slice(0, 5).join("\n") +
                (rejected.length > 5 ? `\n+${rejected.length - 5} more` : "");
            setToastMsg(msg);
        }

        if (accepted.length) handleFilesPicked(accepted);
    };

    return (
        <div
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className="relative flex h-full flex-col"
        >
            <div className="mb-1 flex items-center justify-between rounded-md border border-neutral-700 shadow-md">
                <div className="flex items-center gap-4 px-2">
                    <div className="p-2">
                        <div className="flex items-center gap-2">
                            <h1 className="text-asparagus text-xl font-bold tracking-tighter">
                                {name}
                            </h1>
                            <PrimaryBadge size={20} show={isPrimary} className="mt-0.5" />
                        </div>
                        {description ? (
                            <h2 className="text-broccoli font-semibold tracking-tighter">
                                {description}
                            </h2>
                        ) : null}
                    </div>
                    <ViewToggle view={view} onChange={onChangeView} className="shrink-0" />
                </div>

                <div className="relative my-2 mr-2 flex items-center">
                    <CalendarQuickActions
                        isPrimary={isPrimary}
                        onCreateEvent={() => toggle("create")}
                        onSearchEvents={() => toggle("search")}
                        onOpenSettings={() => toggle("settings")}
                        onDeleteCalendar={() => toggle("delete")}
                        onClearChat={() => toggle("clear")}
                    />

                    {openPanel && (
                        <div className="absolute top-full right-0 z-50 mt-2">
                            <div className="w-120 rounded-md border border-neutral-800 bg-neutral-900/95 p-4 shadow-xl">
                                {openPanel === "create" && (
                                    <PopupOverlay onClose={close}>
                                        <CreateEventPopup onClose={close} />
                                    </PopupOverlay>
                                )}

                                {openPanel === "search" && (
                                    <PopupOverlay onClose={close}>
                                        <SearchEventsPopup onClose={close} />
                                    </PopupOverlay>
                                )}

                                {openPanel === "settings" && (
                                    <PopupOverlay onClose={close}>
                                        <CalendarSettingsPopup
                                            calendarId={calendar!.id}
                                            onClose={close}
                                        />
                                    </PopupOverlay>
                                )}

                                {openPanel === "delete" && (
                                    <PopupOverlay onClose={close}>
                                        <DeleteCalendarPopup onClose={close} />
                                    </PopupOverlay>
                                )}

                                {openPanel === "clear" && (
                                    <PopupOverlay onClose={close}>
                                        <ClearChatPopup
                                            onClose={close}
                                            onCleared={() => {
                                                setMessages([]);
                                                saveStagedForChat([]);
                                                requestAnimationFrameScroll("auto");
                                            }}
                                        />
                                    </PopupOverlay>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div
                key={chatId}
                ref={scrollerRef}
                onScroll={onScroll}
                className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-600 relative flex-1 overflow-y-auto pt-2"
            >
                <MessageList messages={messages} />
                {thinking && <AIChatLoading />}
                {loadingChat && (
                    <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center bg-night">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-asparagus" />
                    </div>
                )}
                {isDragging && <DragActive />}
            </div>

            <div>
                <AttachmentsCard
                    items={staged.map((s) => s.filename)}
                    onRemove={removeAttachment}
                />
                <Chatbox
                    onFilesPicked={handleFilesPicked}
                    onSend={handleSend}
                    toastMessage={toastMsg}
                    onDismissToast={() => setToastMsg(null)}
                    remainingSlots={remainingSlots}
                />
            </div>
        </div>
    );
}
