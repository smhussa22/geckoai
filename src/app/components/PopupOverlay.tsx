"use client";
import React from "react";

type Props = {
    onClose: () => void;
    children: React.ReactNode;
};

export default function PopupOverlay({ onClose, children }: Props) {
    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="max-w-lg w-full rounded-xl bg-neutral-900 p-6 shadow-lg"
            >
                {children}
            </div>
        </div>
    );
}
