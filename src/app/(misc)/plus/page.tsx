"use client";
import React from "react";
import Link from "next/link";
import { GrFormUpload } from "react-icons/gr";
import { TiCloudStorageOutline } from "react-icons/ti";
import { LuMessageSquareLock, LuMessageSquareMore } from "react-icons/lu";

type Plan = {
    name: string;
    price: string;
    priceNote?: string;
    bullets: { text: string; icon: React.ReactNode }[];
    ctaText: string;
    featured?: boolean;
    onClick?: () => void;
};

const iconSize = 40;
const icons = {
    upload: <GrFormUpload size={iconSize} />,
    cloud: <TiCloudStorageOutline size={iconSize} />,
    messageLock: <LuMessageSquareLock size={iconSize} />,
    messageOpen: <LuMessageSquareMore size={iconSize} />,
};

export default function GeckoAIPlusPage() {
    const startBasic = () => alert("Basic is your current free plan.");
    const startPlus = () => alert("Replace with Stripe checkout call.");

    const plans: Plan[] = [
        {
            name: "Basic",
            price: "Free",
            bullets: [
                { text: "50 MB total cloud storage", icon: icons.cloud },
                { text: "5 file uploads cooldown", icon: icons.upload },
                { text: "20 messages cooldown", icon: icons.messageLock },
            ],
            ctaText: "Your Plan",
            onClick: startBasic,
        },
        {
            name: "GeckoAI",
            price: "CA$0.99",
            bullets: [
                { text: "Unlimited cloud storage", icon: icons.cloud },
                { text: "Unlimited file uploads", icon: icons.upload },
                { text: "Unlimited messages", icon: icons.messageOpen },
            ],
            ctaText: "Upgrade for CA$0.99",
            featured: true,
            onClick: startPlus,
        },
    ];

    return (
        <div className="text-ghost relative overflow-hidden bg-[#131112]">
            <header className="relative z-10">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
                    <Link
                        href="/"
                        className="flex items-center gap-3 transition-opacity duration-200 hover:opacity-70"
                    >
                        <img
                            src="/logoAnimated.svg"
                            alt="GeckoAI"
                            draggable={false}
                            className="h-17 w-17 drop-shadow"
                        />

                        <span className="text-asparagus text-6xl font-extrabold tracking-tighter">
                            GeckoAI
                        </span>
                    </Link>

                    <nav className="flex items-center gap-4">
                        <Link
                            href="/login"
                            className="bg-broccoli text-night hover:bg-night hover:text-broccoli inline-flex items-center gap-2 rounded-md border border-neutral-800 px-10 py-3 text-xl font-bold tracking-tighter transition"
                        >
                            Log In
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="relative z-10 h-[calc(100vh-64px)]">
                <div className="mx-auto h-full max-w-7xl px-4">
                    <div className="grid h-full grid-rows-[auto,1fr] items-center gap-8 md:grid-cols-2 md:grid-rows-1">
                        <div className="max-w-xl">
                            <h1 className="text-4xl leading-tight font-black tracking-tight md:text-6xl">
                                Unlock more with{" "}
                                <span className="bg-[linear-gradient(135deg,#698f3f_0%,#384f1f_100%)] bg-clip-text text-transparent">
                                    GeckoAI Plus
                                </span>
                            </h1>

                            <p className="mt-4 text-xl text-white/80">
                                One small price. One huge upgrade.
                                <span className="text-ghost font-semibold">
                                    {" "}
                                    Unlimited everything.
                                </span>{" "}
                                <br />
                                No committments,{" "}
                                <span className="text-ghost font-semibold">one-time payment!</span>
                            </p>

                            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-white/70 md:text-sm">
                                <Chip>One-Time Purchase</Chip>
                                <Chip>80% Launch Discount</Chip>
                                <Chip>Unlimited Experience</Chip>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {plans.map((p) => (
                                <PlanCard key={p.name} plan={p} />
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function PlanCard({ plan }: { plan: Plan }) {
    const green = "#698f3f";
    return (
        <div
            className="relative rounded-2xl border p-6 shadow-xl bg-neutral-900"
        >
            <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-extrabold tracking-tight md:text-2xl">{plan.name}</h3>
                <div className="text-right">
                    <div className="text-xl font-black md:text-2xl">{plan.price}</div>
                </div>
            </div>

            <ul className="mt-5 space-y-3">
                {plan.bullets.map((b, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                        <span className="shrink-0 leading-none text-[#698f3f]">{b.icon}</span>
                        <span className="text-ghost leading-tight">{b.text}</span>
                    </li>
                ))}
            </ul>

            <button
                onClick={plan.onClick}
                className="mt-6 w-full rounded-xl px-5 py-3 text-sm font-semibold transition"
                style={
                    plan.featured
                        ? { backgroundColor: green, color: "#0e0f0e" }
                        : { backgroundColor: "rgba(255,255,255,0.06)" }
                }
                onMouseEnter={(e) => {
                    if (plan.featured) e.currentTarget.style.backgroundColor = "#7cab4a";
                    else e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={(e) => {
                    if (plan.featured) e.currentTarget.style.backgroundColor = green;
                    else e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
                }}
            >
                {plan.ctaText}
            </button>
        </div>
    );
}

function Chip({ children }: { children: React.ReactNode }) {
    return (
        <span className="rounded-full border border-neutral-800 bg-[#1a1819] px-3 py-1">
            {children}
        </span>
    );
}
