"use client";
import React, { useEffect, useRef, useState } from "react";

type ChatboxProps = {

    placeholder?: string;
    maxLength?: number;
    className?: string;
    onChangeText?: (value: string) => void;

};

export default function Chatbox( { placeholder = "Type instructions…", maxLength = 1000, className = "", onChangeText}: ChatboxProps) {

    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {

        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.style.height = "auto";

        const baseHeight = textarea.scrollHeight < textarea.clientHeight ? textarea.clientHeight : textarea.clientHeight;

        textarea.style.height = Math.max(baseHeight, textarea.scrollHeight) + "px";

    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {

        const next = e.target.value.slice(0, maxLength);
        setValue(next);
        onChangeText?.(next);

    };

  return (

    <div className={`relative ${className}`}>

      <textarea ref={textareaRef} value={value} onChange={handleChange} maxLength={maxLength} autoCapitalize="off" spellCheck={false} autoCorrect="off" placeholder={placeholder} 
      className="scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-800 absolute bottom-0 resize-none tracking-tighter w-full rounded-md border border-neutral-700  bg-neutral-800 p-3 leading-6 text-asparagus placeholder-broccoli focus:outline-none focus:ring-0"/>

      <div className={`pointer-events-none absolute bottom-2 right-2 text-xs ${value.length === maxLength ? "text-red-600" : "text-neutral-500"}`}>

        {value.length}/{maxLength}

      </div>

    </div>

  );

}
