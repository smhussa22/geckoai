"use client";
import React, { useEffect, useRef, useState } from "react";
import { FaAws, FaStripeS, FaGoogle } from "react-icons/fa";
import { SiGooglecloud } from "react-icons/si";
import { BiLogoPostgresql } from "react-icons/bi";
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
        <div ref={rootRef} className="absolute top-4 right-4 z-50 hidden xl:block">
            <div className="relative">
                <motion.button
                    onClick={() => setOpen((o) => !o)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex w-[26rem] cursor-pointer items-center justify-center gap-2 
            rounded-xl border border-neutral-700 
            bg-gradient-to-r from-green-900/60 to-green-700/40 
            px-4 py-2 drop-shadow-lg backdrop-blur-md
            transition-colors hover:from-green-800/60 hover:to-green-600/40"
                    aria-expanded={open}
                >
                    <span className="h-4 w-4 animate-pulse rounded-full bg-green-500 shadow-[0_0_8px_2px_rgba(16,185,129,0.6)]" />
                    <span className="font-semibold text-green-400 drop-shadow-md select-none">
                        Server Status: Operational
                    </span>
                </motion.button>

                <AnimatePresence>
                    {open && (
                        <motion.div
                            key="status-dropdown"
                            initial={{ opacity: 0, y: -10, scale: 0.96, filter: "blur(4px)" }}
                            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -8, scale: 0.97, filter: "blur(4px)" }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute top-full right-0 mt-3 w-[26rem] 
                origin-top space-y-5 rounded-xl border border-neutral-700 
                bg-neutral-900/80 p-5 text-sm text-neutral-300 
                shadow-[0_0_25px_rgba(0,0,0,0.7)] backdrop-blur-xl"
                        >
                            <div>
                                <h2 className="mb-2 text-lg font-bold text-white">Status Codes</h2>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_6px_2px_rgba(16,185,129,0.7)]" />
                                        <span className="text-green-400 font-medium">Green</span> –
                                        Operational
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full bg-yellow-400 shadow-[0_0_6px_2px_rgba(234,179,8,0.7)]" />
                                        <span className="text-yellow-400 font-medium">Yellow</span>{" "}
                                        – Degraded / Partial outage
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_6px_2px_rgba(239,68,68,0.7)]" />
                                        <span className="text-red-400 font-medium">Red</span> –
                                        Major outage
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h2 className="mb-2 text-lg font-bold text-white">Dependencies</h2>
                                <ul className="space-y-3">
                                    {[
                                        {
                                            icon: <FaAws className="text-orange-400" size={18} />,
                                            label: "AWS S3 Cloud Storage",
                                        },
                                        {
                                            icon: (
                                                <FaStripeS className="text-indigo-400" size={18} />
                                            ),
                                            label: "Stripe Payment",
                                        },
                                        {
                                            icon: <FaGoogle className="text-red-500" size={18} />,
                                            label: "Google OAuth 2.0",
                                        },
                                        {
                                            icon: (
                                                <SiGooglecloud
                                                    className="text-blue-400"
                                                    size={18}
                                                />
                                            ),
                                            label: "Google Cloud",
                                        },
                                        {
                                            icon: (
                                                <BiLogoPostgresql
                                                    className="text-sky-500"
                                                    size={18}
                                                />
                                            ),
                                            label: "Neon Postgres Database",
                                        },
                                    ].map((dep, i) => (
                                        <motion.li
                                            key={i}
                                            whileHover={{ scale: 1.02, x: 4 }}
                                            className="flex items-center gap-3"
                                        >
                                            {dep.icon}
                                            <span className="flex-1">{dep.label}</span>
                                            <span className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_6px_2px_rgba(16,185,129,0.7)]" />
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
