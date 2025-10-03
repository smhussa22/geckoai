"use client";
import React from "react";
import Logo from "./Logo";
import IconWithLink from "./IconWithLink";
import { GrSatellite } from "react-icons/gr";
import { FiMessageCircle } from "react-icons/fi";
import RandomFact from "./RandomFact";

// @todo fix the facts remounting

export default function Loading() {
    return (
        <>
            <div className="relative flex h-screen w-screen flex-col items-center justify-center gap-2">
                <img
                    src="/logoAnimated.svg"
                    alt="GeckoAI Logo"
                    draggable={false}
                    className="mb-2 h-30 w-30 animate-bounce"
                />

                <div className="mb-2 rounded-md border-2 border-neutral-800 p-2 shadow-md">
                    <h1 className="text-broccoli font-bold">Did You Know</h1>
                </div>

                <RandomFact />

                <h3 className="font-bold text-neutral-700">Trouble connecting? Let us know!</h3>

                <div className="flex gap-6">
                    <IconWithLink
                        href="/server-status"
                        icon={<GrSatellite size={25} />}
                        text="Server Status"
                        color="asparagus"
                        hover="broccoli"
                    />
                    <IconWithLink
                        href="/contact"
                        icon={<FiMessageCircle size={25} />}
                        text="Contact Us"
                        color="asparagus"
                        hover="broccoli"
                    />
                </div>
            </div>
        </>
    );
}
