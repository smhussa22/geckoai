"use client";

import { useState } from "react";

type BuyButtonProps = {
    userId?: string; 
    priceId?: string; 
    className?: string;
};

const DUMMY_USER_ID = "user_demo_0001";

export default function BuyButton({ userId = DUMMY_USER_ID, priceId, className }: BuyButtonProps) {
    const [loading, setLoading] = useState(false);

    async function handleClick() {
        setLoading(true);
        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, priceId }),
            });

            if (res.ok) {
                const { url } = await res.json();
                if (url) {
                    window.location.href = url; 
                    return;
                }
            }
            alert("Demo mode: API not ready, simulating success redirect.");
            window.location.href = "/checkout/success?demo=1";
        } catch (e) {
            console.error(e);
            alert("Could not start checkout. (Demo: going to success page.)");
            window.location.href = "/checkout/success?demo=1";
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            aria-busy={loading}
            className={
                className ??
                "rounded-2xl px-5 py-3 font-medium shadow bg-emerald-600 text-white disabled:opacity-60"
            }
        >
            {loading ? "Redirecting…" : "Get GeckoAI Plus"}
        </button>
    );
}
