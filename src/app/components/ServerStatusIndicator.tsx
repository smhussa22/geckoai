"use client";
import React, { useEffect, useRef, useState } from "react";
import { FaAws } from "react-icons/fa";
import { SiGooglecloud } from "react-icons/si";
import { BiLogoPostgresql } from "react-icons/bi";
import { FaStripeS } from "react-icons/fa";
import { FaGoogle } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

export default function ServerStatus() {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(e.target as Node)) setOpen(false);
        };
        if (open) document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, [open]);

    return (
        <div ref={rootRef} className="absolute top-2 right-2 z-50 hidden xl:block">
            <div className="relative">
                <button
                    onClick={() => setOpen((o) => !o)}
                    className="flex w-[26rem] cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 drop-shadow-md"
                    aria-expanded={open}
                >
                    <span className="h-4 w-4 animate-pulse rounded-full bg-green-700" />
                    <span className="font-medium whitespace-nowrap text-green-700 select-none">
                        Server Status: Operational
                    </span>
                </button>

                {/* Dropdown (same fixed width) */}
                <AnimatePresence>
                    {open && (
                        <motion.div
                            key="status-dropdown"
                            initial={{ opacity: 0, y: -6, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.98 }}
                            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute top-full right-0 mt-2 w-[26rem] origin-top space-y-4 rounded-xl border border-neutral-700 bg-neutral-900 p-4 text-sm text-neutral-300 shadow-lg"
                        >
                            {/* Status codes */}
                            <div>
                                <h2 className="mb-2 font-semibold text-white">Status Codes</h2>
                                <ul className="space-y-1">
                                    <li className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full bg-green-700" />
                                        <span className="text-green-500">Green</span> – Operational
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full bg-yellow-500" />
                                        <span className="text-yellow-500">Yellow</span> – Degraded
                                        performance / partial outage
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full bg-red-600" />
                                        <span className="text-red-500">Red</span> – Major outage /
                                        unavailable
                                    </li>
                                </ul>
                            </div>

                            {/* Dependencies */}
                            <div>
                                <h2 className="mb-2 font-semibold text-white">Dependencies</h2>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2">
                                        <FaAws className="text-orange-400" size={18} />
                                        <span className="flex-1">AWS S3 Cloud Storage</span>
                                        <span className="h-3 w-3 rounded-full bg-green-700" />
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <FaStripeS className="text-indigo-400" size={18} />
                                        <span className="flex-1">Stripe Payment</span>
                                        <span className="h-3 w-3 rounded-full bg-green-700" />
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <FaGoogle className="text-red-500" size={18} />
                                        <span className="flex-1">Google OAuth 2.0</span>
                                        <span className="h-3 w-3 rounded-full bg-green-700" />
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <SiGooglecloud className="text-blue-400" size={18} />
                                        <span className="flex-1">Google Cloud</span>
                                        <span className="h-3 w-3 rounded-full bg-green-700" />
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <BiLogoPostgresql className="text-sky-500" size={18} />
                                        <span className="flex-1">Neon Postgres Database</span>
                                        <span className="h-3 w-3 rounded-full bg-green-700" />
                                    </li>
                                </ul>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
