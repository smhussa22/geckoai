"use client";
import { useState, useEffect, useMemo } from "react";

export default function TimeZoneSelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (timeZone: string) => void;
}) {
    const [loading, setLoading] = useState(true);
    const zones = useMemo(() => Intl.supportedValuesOf("timeZone"), []);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/google/timezone", { cache: "no-store" });
                const data = await res.json().catch(() => null);

                if (res.ok && data?.timeZone && !value) onChange(data.timeZone);
                else if (!value) onChange(Intl.DateTimeFormat().resolvedOptions().timeZone);
            } catch (error: any) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        })();
    }, [onChange, value]);

    const options = value && !zones.includes(value) ? [value, ...zones] : zones;

    if (loading) {
        return <p className="text-neutral-400">Loading time zones…</p>; // @todo make a modal loading screen
    }

    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="border-asparagus w-full appearance-none rounded-md border-b-2 bg-neutral-800 p-3 pt-5 text-neutral-200 transition-colors outline-none"
        >
            {options.map((zone) => (
                <option key={zone} value={zone}>
                    {zone}
                </option>
            ))}
        </select>
    );
}
