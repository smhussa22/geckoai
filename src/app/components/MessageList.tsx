"use client";
import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MessageBubble from "./MessageBubble";
import AIChatLoading from "./AIChatLoading";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { useUser } from "../contexts/UserContext";

export type Attachment = {
    id: string;
    name: string;
    url: string;
};

export type ChatMessage = {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
    attachments?: Attachment[];
};

type MessageListProps = {
    messages: ChatMessage[];
    isStreaming?: boolean;
};

const itemVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
};

const itemTransition = {
    duration: 0.18,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

function parseEventBlocks(content?: string) {
    if (!content) return [];
    const blocks = content.split(/\n{2,}/).filter((b) => b.includes("Date:"));
    return blocks.map((block) => {
        const lines = Object.fromEntries(
            block
                .split("\n")
                .map((l) => l.split(":").map((s) => s.trim()))
                .filter(([k, v]) => k && v)
        );
        return {
            title: lines["Title"] || "Unnamed Event",
            date: lines["Date"] || "",
            start: lines["StartTime"] || "",
            end: lines["EndTime"] || "",
            location: lines["Location"] || "",
            timeZone: lines["TimeZone"] || "",
            recurrence: lines["Recurrence"] || "",
        };
    });
}

export default function MessageList({ messages, isStreaming }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const { user } = useUser();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages.length, isStreaming]);

    if (messages.length === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center py-20 text-center">
                <Image
                    draggable={false}
                    src="/logoAnimated.svg"
                    alt="GeckoAI Hand Logo"
                    width={80}
                    height={80}
                    className="mb-4 animate-bounce"
                />
                <h2 className="text-asparagus text-2xl font-bold tracking-tight">
                    Hello, {user?.firstName || "there"}
                </h2>
                <p className="mt-2 max-w-md text-sm text-neutral-400">
                    Automate some events with text instructions, or drop your files instead!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <AnimatePresence initial={false}>
                {messages.map((m) => {
                    const eventBlocks = m.role === "assistant" ? parseEventBlocks(m.content) : [];

                    return (
                        <motion.div
                            key={m.id}
                            layout
                            variants={itemVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={itemTransition}
                        >
                            <MessageBubble role={m.role} attachments={m.attachments}>
                                {eventBlocks.length > 0 ? (
                                    <div className="space-y-2">
                                        {eventBlocks.map((ev, i) => (
                                            <div
                                                key={i}
                                                className="rounded-md border border-neutral-700 bg-neutral-800/50 p-3 text-sm"
                                            >
                                                <p className="font-bold text-asparagus">
                                                    {ev.title}
                                                </p>
                                                <p>Date: {ev.date}</p>
                                                {ev.start && <p>Start: {ev.start}</p>}
                                                {ev.end && <p>End: {ev.end}</p>}
                                                {ev.location && <p>Location: {ev.location}</p>}
                                                {ev.timeZone && <p>TimeZone: {ev.timeZone}</p>}
                                                {ev.recurrence && (
                                                    <p>Recurrence: {ev.recurrence}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <ReactMarkdown>{m.content || ""}</ReactMarkdown>
                                )}
                            </MessageBubble>
                        </motion.div>
                    );
                })}

                {isStreaming && (
                    <motion.div
                        key="ai-typing"
                        layout
                        initial={{ opacity: 0, scale: 0.98, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -6 }}
                        transition={{ duration: 0.16 }}
                    >
                        <AIChatLoading />
                    </motion.div>
                )}
            </AnimatePresence>

            <div ref={bottomRef} />
        </div>
    );
}
