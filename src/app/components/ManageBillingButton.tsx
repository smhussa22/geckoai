"use client";

import { useState } from "react";

type ManageBillingButtonProps = {
    userId?: string; 
    className?: string;
};

const DUMMY_USER_ID = "user_demo_0001";

export default function ManageBillingButton({
    userId = DUMMY_USER_ID,
    className,
}: ManageBillingButtonProps) {
    const [loading, setLoading] = useState(false);

    async function handleClick() {
        setLoading(true);
        try {
            const res = await fetch("/api/billing-portal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });

            if (res.ok) {
                const { url } = await res.json();
                if (url) {
                    window.location.href = url; // real Stripe Customer Portal
                    return;
                }
            }

            alert("Demo mode: API not ready. Staying on this page.");
        } catch (e) {
            console.error(e);
            alert("Could not open billing portal (demo mode).");
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            aria-busy={loading}
            className={className ?? "rounded-xl px-4 py-2 border shadow-sm disabled:opacity-60"}
        >
            {loading ? "Opening…" : "Manage billing"}
        </button>
    );
}
