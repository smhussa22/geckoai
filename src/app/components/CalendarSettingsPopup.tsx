"use client";
import React, { useEffect, useMemo, useState } from "react";
import { BsXCircle } from "react-icons/bs";
import {
    TbCalendarHeart,
    TbCalendarDot,
    TbCalendarCode,
    TbCalendarClock,
    TbCalendarDollar,
    TbCalendarStar,
    TbCalendarPin,
    TbCalendarUser,
} from "react-icons/tb";
import { IoIosSettings } from "react-icons/io";
import type { IconType } from "react-icons";

type LowerVis = "default" | "public" | "private";
type UpperVis = "DEFAULT" | "PUBLIC" | "PRIVATE";

const defaultBackground = "#698f3f";
const defaultIcon = "user";

function toLowerVisibility(value: unknown): LowerVis {
    const lower = String(value || "default").toLowerCase();
    if (lower === "public" || lower === "private") return lower;
    return "default";
}

function toUpperVisibility(value: unknown): UpperVis {
    const upper = String(value || "DEFAULT").toUpperCase();
    if (upper === "PUBLIC" || upper === "PRIVATE" || upper === "DEFAULT") return upper as UpperVis;
    return "DEFAULT";
}

const ICONS: Record<string, IconType> = {
    heart: TbCalendarHeart,
    dot: TbCalendarDot,
    code: TbCalendarCode,
    clock: TbCalendarClock,
    dollar: TbCalendarDollar,
    star: TbCalendarStar,
    pin: TbCalendarPin,
    user: TbCalendarUser,
};

const visibilityOptions: LowerVis[] = ["default", "public", "private"];

export default function CalendarSettingsPopup({
    calendarId,
    onClose,
    onSaved,
}: {
    calendarId: string;
    onClose?: () => void;
    onSaved?: (updated: any) => void;
}) {
    const [calendarName, setCalendarName] = useState("");
    const [calendarDescription, setCalendarDescription] = useState("");
    const [visibility, setVisibility] = useState<LowerVis>("default");
    const [selectedIconKey, setSelectedIconKey] = useState<string>(defaultIcon);
    const [colorHex, setColorHex] = useState(defaultBackground);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setErrorMsg(null);

                const response = await fetch(`/api/calendars/${encodeURIComponent(calendarId)}`, {
                    cache: "no-store",
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        (data && data.error) || `Failed to load calendar (${response.status})`
                    );
                }

                setCalendarName(data && data.name ? data.name : "");
                setCalendarDescription(data && data.description ? data.description : "");
                setVisibility(toLowerVisibility(data && data.defaultVisibility));
                setSelectedIconKey(ICONS[data?.icon] ? data.icon : defaultIcon);
                setColorHex(data && data.color ? data.color : defaultBackground);
            } catch (error: any) {
                setErrorMsg((error && error.message) || "Failed to load calendar.");
            } finally {
                setLoading(false);
            }
        })();
    }, [calendarId]);

    const canSave = useMemo(
        () => !saving && !loading && !!calendarName.trim(),
        [saving, loading, calendarName]
    );

    async function handleSave() {
        if (!canSave) return;

        try {
            setSaving(true);
            setErrorMsg(null);

            const response = await fetch(`/api/calendars/${encodeURIComponent(calendarId)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: calendarName.trim(),
                    description: calendarDescription || "",
                    defaultVisibility: toUpperVisibility(visibility),
                    icon: ICONS[selectedIconKey] ? selectedIconKey : defaultIcon,
                    color: colorHex || defaultBackground,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) throw new Error((data && data.error) || "Failed to save.");
            if (onSaved) onSaved(data);
            if (onClose) onClose();
        } catch (error: any) {
            setErrorMsg((error && error.message) || "Failed to save.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="w-full">
            <div className="relative flex">
                <div>
                    <h1 className="text-asparagus text-2xl font-bold tracking-tighter">
                        Calendar Settings
                    </h1>
                    <h2 className="text-broccoli mb-2 font-semibold tracking-tighter">
                        Manage settings and preferences for this calendar.
                    </h2>
                </div>

                <button
                    onClick={onClose}
                    className="absolute right-0 text-neutral-700 transition-colors duration-200 hover:text-neutral-600"
                >
                    <BsXCircle size={25} />
                </button>
            </div>

            <div className="my-2 flex items-center gap-3">
                <hr className="flex-1 border-neutral-800" />

                <span className="text-xs tracking-tighter text-neutral-400">
                    {loading ? "Loading…" : "Google Calendar"}
                </span>

                <hr className="flex-1 border-neutral-800" />
            </div>

            {errorMsg && (
                <div className="mb-2 rounded-md bg-red-900/30 px-3 py-2 text-sm text-red-300 ring-1 ring-red-900">
                    {errorMsg}
                </div>
            )}

            {loading ? (
                <div className="text-sm text-neutral-300">Loading…</div>
            ) : (
                <>
                    <div className="space-y-2">
                        <div className="flex flex-col gap-1">
                            <label className="text-ghost ml-0.5 text-xs">Calendar Name</label>

                            <input
                                type="text"
                                value={calendarName}
                                onChange={(event) => setCalendarName(event.target.value)}
                                placeholder="Add calendar name"
                                autoCapitalize="off"
                                spellCheck={false}
                                autoCorrect="off"
                                maxLength={40}
                                className="text-ghost w-full rounded-md border-b-2 border-transparent bg-neutral-800 px-2.5 py-1.5 text-sm placeholder-neutral-500 transition-colors outline-none focus:border-neutral-700"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-ghost ml-0.5 gap-1 text-xs">
                                Calendar Description
                            </label>

                            <textarea
                                value={calendarDescription}
                                onChange={(event) => setCalendarDescription(event.target.value)}
                                placeholder="Add description"
                                autoCapitalize="off"
                                spellCheck={false}
                                autoCorrect="off"
                                maxLength={50}
                                className="text-ghost scrollbar-none h-8 w-full resize-none rounded-md border-b-2 border-transparent bg-neutral-800 px-2.5 py-1.5 text-sm placeholder-neutral-500 transition-colors outline-none focus:border-neutral-700"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-ghost ml-0.5 text-xs">
                                Default Event Visibility
                            </label>

                            <div className="inline-flex h-9 w-fit items-center rounded-lg bg-neutral-800 p-1">
                                {visibilityOptions.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => setVisibility(option)}
                                        className={`h-full rounded-md px-3 text-sm font-medium transition-colors ${
                                            visibility === option
                                                ? "bg-neutral-700 text-white"
                                                : "text-neutral-300 hover:bg-neutral-700/50 hover:text-white"
                                        }`}
                                    >
                                        {option === "default"
                                            ? "Calendar Default"
                                            : option[0].toUpperCase() + option.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="my-2 flex items-center gap-3">
                        <hr className="flex-1 border-neutral-800" />

                        <span className="text-xs tracking-tighter text-neutral-400">
                            Appearance in List
                        </span>

                        <hr className="flex-1 border-neutral-800" />
                    </div>

                    <div className="space-y-2">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-ghost text-xs">Calendar Icon</h3>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                {Object.entries(ICONS).map(([key, Icon]) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedIconKey(key)}
                                        className={`rounded-lg bg-neutral-800 p-1.5 transition-colors hover:bg-neutral-700 ${
                                            selectedIconKey === key
                                                ? "ring-asparagus ring-2"
                                                : "ring-1 ring-neutral-800"
                                        }`}
                                    >
                                        <Icon size={22} className="text-ghost" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-ghost text-xs">Calendar Color</h3>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={colorHex}
                                    onChange={(event) => setColorHex(event.target.value)}
                                    className="h-8 w-8 cursor-pointer rounded-md bg-neutral-800 p-0.5 ring-1 ring-neutral-800"
                                />

                                <input
                                    type="text"
                                    value={colorHex}
                                    onChange={(event) => {
                                        const raw = event.target.value;
                                        const withHash = raw.startsWith("#") ? raw : `#${raw}`;
                                        setColorHex(withHash.slice(0, 7));
                                    }}
                                    placeholder={defaultBackground}
                                    className="text-ghost w-24 rounded-md bg-neutral-800 px-2 py-1 text-xs ring-1 ring-neutral-800 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className="mt-2 flex items-center justify-end">
                <button
                    onClick={handleSave}
                    disabled={!canSave}
                    className="group text-night flex w-full items-center justify-center rounded-lg bg-gray-500 px-4 py-2 text-2xl font-bold tracking-tighter duration-200 disabled:opacity-60"
                >
                    <span className="relative flex items-center">
                        <span className="inline-flex w-0 overflow-hidden transition-all duration-300 ease-out group-hover:w-9">
                            <IoIosSettings
                                size={36}
                                className="group-hover:animate-[spin_1200ms_linear_0.3]"
                            />
                        </span>
                        <span className="ml-0 transition-all duration-300 group-hover:ml-2">
                            {saving ? "Saving…" : "Save"}
                        </span>
                    </span>
                </button>
            </div>
        </div>
    );
}
