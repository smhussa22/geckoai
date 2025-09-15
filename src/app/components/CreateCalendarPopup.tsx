// CreateCalendarPage.tsx
"use client";
import React, { useState } from "react";
import { Tooltip } from "react-tooltip";
import { LuCalendarPlus } from "react-icons/lu";
import { BsXCircle } from "react-icons/bs";
import TimeZoneSelect from "./TimeZoneSelect";

export default function CreateCalendarPage({ onClose }: { onClose?: () => void }) {
    const [nameVal, setNameVal] = useState("");
    const [nameFocused, setNameFocused] = useState(false);
    const [nameTouched, setNameTouched] = useState(false);
    const [descVal, setDescVal] = useState("");
    const [descFocused, setDescFocused] = useState(false);
    const [timeZone, setTimeZone] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const nameError = nameTouched && !nameVal.trim();

    const handleCreate = async () => {
        setErrorMsg(null);

        if (!nameVal.trim() || !timeZone) {
            setNameTouched(true);
            setErrorMsg("Name and time zone are required.");
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch("/api/calendars", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    summary: nameVal.trim(),
                    description: descVal,
                    timeZone,
                }),
            });

            const data = await res.json().catch(() => null);
            if (!res.ok)
                throw new Error(data?.error || res.statusText || "Failed to create calendar");

            onClose?.();
        } catch (e: any) {
            setErrorMsg(e?.message || "Failed to create calendar.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className="relative flex">
                <div>
                    <h1 className="text-asparagus text-2xl font-bold tracking-tighter">
                        Create Calendar
                    </h1>
                    <h2 className="text-broccoli mb-2 font-semibold tracking-tighter">
                        Conveniently create a new Google calendar.
                    </h2>
                </div>

                <button
                    onClick={onClose}
                    className="absolute right-0 mb-5 text-neutral-700 transition-colors duration-200 hover:text-neutral-600"
                >
                    <BsXCircle size={25} />
                </button>
            </div>

            <div className="relative mt-4">
                <input
                    type="text"
                    value={nameVal}
                    onChange={(e) => setNameVal(e.target.value)}
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => {
                        setNameFocused(false);
                        setNameTouched(true);
                    }}
                    placeholder=" "
                    autoCapitalize="off"
                    spellCheck={false}
                    autoCorrect="off"
                    maxLength={40}
                    className={`w-full rounded-md border-b-2 bg-neutral-800 p-3 pt-5 text-neutral-200 placeholder-white transition-all outline-none ${
                        nameError
                            ? "border-red-700"
                            : nameVal
                              ? "border-asparagus"
                              : nameFocused
                                ? "border-neutral-700"
                                : "border-transparent"
                    }`}
                />

                <label
                    className={`absolute left-3 flex items-center gap-1 transition-all ${nameFocused || nameVal ? "top-1 text-xs" : "top-3 text-base"} text-white`}
                >
                    <span>Calendar Name</span>

                    {!nameVal && (
                        <span
                            className="text-red-700"
                            data-tooltip-id="asterisk"
                            data-tooltip-content="This is a required field."
                        >
                            *
                        </span>
                    )}

                    <Tooltip
                        id="asterisk"
                        place="right"
                        opacity={1}
                        style={{
                            marginLeft: "0.5rem",
                            backgroundColor: "#131112",
                            padding: "0.4rem",
                            borderRadius: "0.375rem",
                            color: "#b91c1c",
                            zIndex: 50,
                        }}
                        noArrow
                    />
                </label>

                <div className="mt-1 h-5 text-sm">
                    {nameError && (
                        <span className="text-red-700">You must enter a calendar name.</span>
                    )}
                </div>
            </div>

            <div className="relative mt-2 w-100">
                <textarea
                    value={descVal}
                    onChange={(e) => setDescVal(e.target.value)}
                    onFocus={() => setDescFocused(true)}
                    onBlur={() => setDescFocused(false)}
                    placeholder=" "
                    autoCapitalize="off"
                    spellCheck={false}
                    autoCorrect="off"
                    maxLength={50}
                    className={`h-24 w-full resize-none rounded-md border-b-2 bg-neutral-800 p-3 pt-5 text-neutral-200 placeholder-white transition-colors outline-none ${
                        descVal
                            ? "border-asparagus"
                            : descFocused
                              ? "border-neutral-700"
                              : "border-transparent"
                    }`}
                />

                <label
                    className={`pointer-events-none absolute left-3 transition-all ${descFocused || descVal ? "top-1 text-xs" : "top-3 text-base"} text-white`}
                >
                    Calendar Description
                </label>
            </div>

            <div className="relative mt-6">
                <label className="pointer-events-none absolute top-1 left-3 text-xs text-white">
                    Time Zone
                </label>

                <TimeZoneSelect value={timeZone} onChange={setTimeZone} />
            </div>

            {errorMsg && <p className="mt-3 text-sm text-red-600">{errorMsg}</p>}

            <button
                onClick={handleCreate}
                disabled={submitting}
                className="bg-broccoli text-night hover:bg-night hover:text-broccoli mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-800 py-3 text-2xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
                <LuCalendarPlus size={35} />
                {submitting ? "Creating..." : "Create New Calendar"}
            </button>
        </>
    );
}
