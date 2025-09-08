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

  // Close when clicking outside
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div ref={rootRef} className="absolute right-2 top-2 z-50">
      <div className="relative">
        {/* Fixed-width status pill (no shift on open) */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="cursor-pointer drop-shadow-md flex items-center gap-2 bg-neutral-900 border border-neutral-700 px-3 py-2 rounded-xl w-[26rem] justify-center"
          aria-expanded={open}
        >
          <span className="rounded-full w-4 h-4 bg-green-700 animate-pulse" />
          <span className="text-green-700 font-medium select-none whitespace-nowrap">
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
              className="absolute right-0 top-full mt-2 w-[26rem] bg-neutral-900 border border-neutral-700 rounded-xl shadow-lg p-4 space-y-4 text-sm text-neutral-300 origin-top"
            >
              {/* Status codes */}
              <div>
                <h2 className="font-semibold text-white mb-2">Status Codes</h2>
                <ul className="space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-700" />
                    <span className="text-green-500">Green</span> – Operational
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-yellow-500">Yellow</span> – Degraded performance / partial outage
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-600" />
                    <span className="text-red-500">Red</span> – Major outage / unavailable
                  </li>
                </ul>
              </div>

              {/* Dependencies */}
              <div>
                <h2 className="font-semibold text-white mb-2">Dependencies</h2>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <FaAws className="text-orange-400" size={18} />
                    <span className="flex-1">AWS S3 Cloud Storage</span>
                    <span className="w-3 h-3 rounded-full bg-green-700" />
                  </li>
                  <li className="flex items-center gap-2">
                    <FaStripeS className="text-indigo-400" size={18} />
                    <span className="flex-1">Stripe Payment</span>
                    <span className="w-3 h-3 rounded-full bg-green-700" />
                  </li>
                  <li className="flex items-center gap-2">
                    <FaGoogle className="text-red-500" size={18} />
                    <span className="flex-1">Google OAuth 2.0</span>
                    <span className="w-3 h-3 rounded-full bg-green-700" />
                  </li>
                  <li className="flex items-center gap-2">
                    <SiGooglecloud className="text-blue-400" size={18} />
                    <span className="flex-1">Google Cloud</span>
                    <span className="w-3 h-3 rounded-full bg-green-700" />
                  </li>
                  <li className="flex items-center gap-2">
                    <BiLogoPostgresql className="text-sky-500" size={18} />
                    <span className="flex-1">Neon Postgres Database</span>
                    <span className="w-3 h-3 rounded-full bg-green-700" />
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
