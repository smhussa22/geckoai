"use client";
import React, { useState, useRef, useEffect } from "react";
import { Plus, Send, Mic } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { AnimatePresence, motion } from "framer-motion";
import FilePickerPopup from "./FilePickerPopup";
import { acceptableFiles, maxFilesPerMessage } from "../../lib/acceptableFiles";

type ChatboxProps = {
    maxLength?: number;
    className?: string;
    onFilesPicked?: (files: File[]) => void;
    onSend?: (text: string) => void;
    toastMessage?: string | null;
    onDismissToast?: () => void;
    remainingSlots?: number;
};

export default function Chatbox({
    maxLength = 20000,
    className = "",
    onFilesPicked,
    onSend,
    toastMessage,
    onDismissToast,
    remainingSlots = maxFilesPerMessage,
}: ChatboxProps) {
    const [value, setValue] = useState("");
    const [containerHeight, setContainerHeight] = useState(80);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const hasText = value.trim().length > 0;
    const padding = 76;

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            const newHeight = Math.min(Math.max(textarea.scrollHeight + padding, 80), 240);
            setContainerHeight(newHeight);
            textarea.style.height = `${newHeight - padding}px`;
        }
    }, [value]);

    useEffect(() => {
        if (!toastMessage) return;
        const t = setTimeout(() => onDismissToast?.(), 4000);
        return () => clearTimeout(t);
    }, [toastMessage, onDismissToast]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value.length <= maxLength) setValue(e.target.value);
    };

    const handlePick = (files: File[]) => {
        onFilesPicked?.(files);
        console.log("[ChatBox] Picked files:", files);
    };

    const handleSend = () => {
        const text = value.trim();
        if (!text) return;
        console.log("[ChatBox] Picked files: ", text);
        onSend?.(text);
        setValue("");
    };

    const onTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const plusDisabled = remainingSlots <= 0;

    return (
        <div className={`flex justify-center ${className}`}>
            <div
                className="relative w-full rounded-xl border border-neutral-700/60 bg-neutral-900 p-3 transition-all duration-300 ease-out"
                style={{ height: `${containerHeight}px` }}
            >
                <AnimatePresence>
                    {toastMessage && (
                        <motion.div
                            key="upload-toast"
                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 500, damping: 40, mass: 0.5 }}
                            className="pointer-events-auto absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50"
                            onClick={onDismissToast}
                            role="status"
                            aria-live="polite"
                        >
                            <div className="rounded-md border border-red-500/50 bg-red-500/15 px-3 py-2 text-sm text-red-200 shadow-lg backdrop-blur">
                                <span className="font-semibold">Upload error: </span>
                                <span className="whitespace-pre-line">{toastMessage}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleChange}
                    onKeyDown={onTextareaKeyDown}
                    placeholder="Type your instructions"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    rows={1}
                    className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-600 w-full resize-none overflow-y-auto bg-transparent p-1 text-neutral-200 placeholder-neutral-500 focus:outline-none"
                    style={{ minHeight: "24px", maxHeight: `${containerHeight - padding}px` }}
                />

                <div className="absolute right-2 bottom-2 left-2 flex h-10 items-center justify-between">
                    <div className="relative">
                        <button
                            data-tooltip-id="plus"
                            data-tooltip-content={
                                plusDisabled
                                    ? "Max 5 files per message reached"
                                    : `Add files (${remainingSlots} left)`
                            }
                            onClick={() => !plusDisabled && setPickerOpen((v) => !v)}
                            disabled={plusDisabled}
                            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 ${
                                plusDisabled
                                    ? "text-neutral-600 cursor-not-allowed"
                                    : "text-neutral-400 hover:bg-neutral-700/40 hover:text-neutral-100"
                            }`}
                        >
                            <Plus size={20} />
                        </button>

                        <FilePickerPopup
                            open={pickerOpen}
                            onClose={() => setPickerOpen(false)}
                            onPick={handlePick}
                            accept={acceptableFiles}
                            remainingSlots={remainingSlots}
                        />
                    </div>

                    <button
                        data-tooltip-id={hasText ? "send" : "mic"}
                        data-tooltip-content={hasText ? "Send Prompt" : "Dictate Mode"}
                        onClick={hasText ? handleSend : undefined}
                        className="relative flex h-10 w-10 items-center justify-center rounded-full text-neutral-400 transition-colors duration-200 hover:bg-neutral-700/40 hover:text-neutral-100"
                    >
                        {hasText ? (
                            <span className="absolute">
                                <Send size={20} />
                            </span>
                        ) : (
                            <span className="absolute">
                                <Mic size={18} />
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <Tooltip noArrow opacity={100} place="right" id="plus" />
            <Tooltip noArrow opacity={100} place="left" id="mic" />
            <Tooltip noArrow opacity={100} place="left" id="send" />
        </div>
    );
}
