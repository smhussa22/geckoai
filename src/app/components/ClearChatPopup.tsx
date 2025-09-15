"use client";
import React, { useState } from "react";
import { BsXCircle } from "react-icons/bs";
import { IoChatboxOutline } from "react-icons/io5";
import { useCalendar } from "../contexts/SelectedCalendarContext";

type Props = {
    /** Close the popup (no side effects) */
    onClose?: () => void;
    /** Called after DELETE succeeds so parent can clear local state */
    onCleared?: () => void;
};

export default function ClearChatPopup({ onClose, onCleared }: Props) {
    const { calendar } = useCalendar();
    const [confirmText, setConfirmText] = useState("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const canDelete = !!calendar && calendar.summary === confirmText;

    const handleDelete = async () => {
        setErrorMsg(null);

        if (!calendar) {
            setErrorMsg("No calendar selected.");
            return;
        }

        if (!canDelete) {
            setErrorMsg("You must type the calendar’s exact name to clear it.");
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch(`/api/chats/${encodeURIComponent(calendar.id)}/messages`, {
                method: "DELETE",
            });

            if (!res.ok) {
                let msg = `Error: ${res.status}`;
                try {
                    const data = await res.json();
                    msg = data?.error || msg;
                } catch {}
                throw new Error(msg);
            }

            onCleared?.();

            onClose?.();
        } catch (error: any) {
            setErrorMsg(error?.message || "Failed to clear chat.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full">
            <div className="relative flex">
                <div>
                    <h1 className="text-asparagus text-2xl font-bold tracking-tighter">
                        Clear Chat
                    </h1>
                    <h2 className="text-broccoli mb-2 font-semibold tracking-tighter">
                        This can be done to free storage.
                    </h2>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-0 mb-5 text-neutral-700 transition-colors duration-200 hover:text-neutral-600"
                >
                    <BsXCircle size={25} />
                </button>
            </div>

            <div className="mt-3 rounded-xl border border-amber-500/50 bg-amber-500/10 p-4">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center text-amber-500">
                        <IoChatboxOutline size={24} />
                    </div>

                    <div className="space-y-1">
                        <p className="font-semibold tracking-tighter text-amber-500">
                            You’re about to permanently clear this chat.
                        </p>
                        <p className="text-sm tracking-tight text-neutral-300">
                            All messages and context of this chat will be permanently deleted.
                        </p>
                    </div>
                </div>
            </div>

            {errorMsg && (
                <div
                    role="alert"
                    className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300"
                >
                    {errorMsg}
                </div>
            )}

            <div className="mt-5">
                <p className="text-asparagus font-semibold tracking-tighter">
                    To unlock this action, type the calendar’s name below.
                </p>

                <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={
                        calendar ? `Type “${calendar.summary}” to confirm` : "No calendar selected"
                    }
                    autoCapitalize="off"
                    spellCheck={false}
                    autoCorrect="off"
                    disabled={submitting || !calendar}
                    className="text-ghost mt-2 w-full border-b-2 border-neutral-700 bg-transparent pb-2 text-lg placeholder-neutral-500 transition-colors outline-none focus:border-neutral-600 disabled:opacity-60"
                />
            </div>

            <div className="mt-6 flex items-center gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="text-night hover:bg-night flex h-12 w-1/2 items-center justify-center rounded-lg bg-neutral-700 px-4 text-xl font-bold tracking-tighter transition-colors duration-200 hover:text-neutral-700 disabled:opacity-60"
                    disabled={submitting}
                >
                    <span className="relative flex items-center">Cancel</span>
                </button>

                <button
                    type="button"
                    onClick={handleDelete}
                    className={`group flex h-12 w-1/2 items-center justify-center rounded-lg px-4 text-xl font-bold tracking-tighter transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                        canDelete
                            ? "hover:bg-night text-night bg-amber-500 hover:text-amber-500"
                            : "bg-neutral-800"
                    }`}
                    disabled={!canDelete || submitting}
                >
                    <span className="relative flex items-center">
                        {canDelete && (
                            <span className="inline-flex w-0 overflow-hidden transition-all duration-300 ease-out group-hover:w-9">
                                <IoChatboxOutline
                                    size={32}
                                    className="mb-0.5 -translate-x-2 opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100"
                                />
                            </span>
                        )}
                        <span
                            className={`ml-0 ${canDelete ? "group-hover:ml-2" : ""} transition-all duration-300`}
                        >
                            {submitting ? "Clearing…" : "Clear"}
                        </span>
                    </span>
                </button>
            </div>
        </div>
    );
}
