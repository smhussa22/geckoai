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

export default function MessageList({ messages, isStreaming }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { user } = useUser();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isStreaming]);

  if (messages.length === 0) {
    // Center ONLY the empty state
    return (
      <div className="h-full flex flex-col items-center justify-center text-center py-20">
        <Image
            draggable={false}
          src="/logoAnimated.svg"
          alt="GeckoAI Hand Logo"
          width={80}
          height={80}
          className="mb-4 animate-bounce"
        />
        <h2 className="text-2xl font-bold tracking-tight text-asparagus">
          Hello, {user?.firstName || "there"}
        </h2>
        <p className="text-neutral-400 text-sm mt-2 max-w-md">
          Automate some events with text instructions, or drop your files instead!
        </p>
      </div>
    );
  }

  // Normal chat list (not centered)
  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {messages.map((m) => (
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
              <ReactMarkdown>{m.content}</ReactMarkdown>
            </MessageBubble>
          </motion.div>
        ))}

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
