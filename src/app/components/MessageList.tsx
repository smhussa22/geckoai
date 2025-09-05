"use client";
import React from "react";
import MessageBubble from "./MessageBubble";
import AIChatLoading from "./AIChatLoading";
import ReactMarkdown from 'react-markdown';

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

export default function MessageList({ messages }: { messages: ChatMessage[] }) {

    return (

        <div className="space-y-3">

            {messages.map((m) => (

                <MessageBubble key={m.id} role={m.role} attachments={m.attachments}>

                    <ReactMarkdown>{m.content}</ReactMarkdown>

                </MessageBubble>

            ))}

        </div>

    );

}
