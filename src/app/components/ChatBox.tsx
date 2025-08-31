// ChatBox.tsx
"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Plus, Send, Mic } from "lucide-react";
import { Tooltip } from "react-tooltip";
import FilePickerPopup from "./FilePickerPopup";
import { acceptableFiles } from "../../lib/acceptableFiles";

type ChatboxProps = {
  
  maxLength?: number;
  className?: string;
  onFilesPicked?: (files: File[]) => void;
  onSend?: (text: string) => void;

};

export default function Chatbox({ maxLength = 4000, className = "", onFilesPicked }: ChatboxProps) {

  const [value, setValue] = useState("");
  const [containerHeight, setContainerHeight] = useState(80);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {

    if (e.target.value.length <= maxLength) setValue(e.target.value);

  };

  const handlePick = (files: File[]) => {

    onFilesPicked?.(files);

  }

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
    if (files.length) onFilesPicked?.(files);

  };

  return (

    <div className={`flex justify-center ${className}`}>

      <div
      className={`relative w-full rounded-xl border border-neutral-700/60 bg-neutral-900 p-3 transition-all duration-300 ease-out ${dragActive ? "ring-2 ring-asparagus/60" : ""}`}
      style={{ height: `${containerHeight}px` }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      >

        {dragActive && (

          <div className="absolute inset-0 grid place-items-center rounded-xl bg-neutral-800/30 pointer-events-none">

            <span className="text-sm text-neutral-300">Drop files to attach…</span>

          </div>

        )}

        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          placeholder="Type your instructions"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          rows={1}
          className="w-full resize-none bg-transparent text-neutral-200 placeholder-neutral-500 focus:outline-none p-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-600"
          style={{ minHeight: "24px", maxHeight: `${containerHeight - padding}px` }}
        />

        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center h-10">

          <div className="relative">

            <button
            data-tooltip-id="plus"
            data-tooltip-content="Add files and more"
            onClick={() => setPickerOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700/40 transition-colors duration-200"
            >

              <Plus size={20} />

            </button>

            <FilePickerPopup open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={handlePick} accept={acceptableFiles}/>

          </div>

          <button
            data-tooltip-id={hasText ? "send" : "mic"}
            data-tooltip-content={hasText ? "Send Prompt" : "Dictate Mode"}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700/40 transition-colors duration-200"
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
