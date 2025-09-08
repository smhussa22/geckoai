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
      const res = await fetch(
        `/api/chats/${encodeURIComponent(calendar.id)}/messages`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        let msg = `Error: ${res.status}`;
        try {
          const data = await res.json();
          msg = data?.error || msg;
        } catch {}
        throw new Error(msg);
      }

      // Notify parent to clear local state only after successful DELETE
      onCleared?.();
      // Then close popup
      onClose?.();
    } catch (error: any) {
      setErrorMsg(error?.message || "Failed to clear chat.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex relative">
        <div>
          <h1 className="text-2xl font-bold tracking-tighter text-asparagus">Clear Chat</h1>
          <h2 className="mb-2 font-semibold tracking-tighter text-broccoli">
            This can be done to free storage.
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute right-0 text-neutral-700 mb-5 transition-colors duration-200 hover:text-neutral-600"
        >
          <BsXCircle size={25} />
        </button>
      </div>

      <div className="mt-3 rounded-xl border border-amber-500/50 bg-amber-500/10 p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 flex items-center justify-center text-amber-500">
            <IoChatboxOutline size={24} />
          </div>

          <div className="space-y-1">
            <p className="text-amber-500 font-semibold tracking-tighter">
              You’re about to permanently clear this chat.
            </p>
            <p className="text-neutral-300 text-sm tracking-tight">
              All messages and context of this chat will be permanently deleted.
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-red-300 text-sm"
        >
          {errorMsg}
        </div>
      )}

      <div className="mt-5">
        <p className="tracking-tighter font-semibold text-asparagus">
          To unlock this action, type the calendar’s name below.
        </p>

        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={calendar ? `Type “${calendar.summary}” to confirm` : "No calendar selected"}
          autoCapitalize="off"
          spellCheck={false}
          autoCorrect="off"
          disabled={submitting || !calendar}
          className="mt-2 w-full bg-transparent text-lg text-ghost outline-none border-b-2 pb-2 transition-colors placeholder-neutral-500 border-neutral-700 focus:border-neutral-600 disabled:opacity-60"
        />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={onClose}
          className="w-1/2 h-12 flex items-center justify-center rounded-lg bg-neutral-700 text-night font-bold px-4 text-xl tracking-tighter transition-colors duration-200 hover:bg-night hover:text-neutral-700 disabled:opacity-60"
          disabled={submitting}
        >
          <span className="relative flex items-center">Cancel</span>
        </button>

        <button
          type="button"
          onClick={handleDelete}
          className={`group w-1/2 h-12 flex items-center justify-center rounded-lg font-bold px-4 text-xl tracking-tighter transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
            canDelete ? "hover:bg-night hover:text-amber-500 bg-amber-500 text-night" : "bg-neutral-800"
          }`}
          disabled={!canDelete || submitting}
        >
          <span className="relative flex items-center">
            {canDelete && (
              <span className="overflow-hidden inline-flex w-0 group-hover:w-9 transition-all duration-300 ease-out">
                <IoChatboxOutline
                  size={32}
                  className="mb-0.5 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out"
                />
              </span>
            )}
            <span className={`ml-0 ${canDelete ? "group-hover:ml-2" : ""} transition-all duration-300`}>
              {submitting ? "Clearing…" : "Clear"}
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
