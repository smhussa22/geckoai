import React from "react";
import type { Metadata } from "next";
import TailLinkPage from "@/app/components/TailLinkPage";

export const metadata: Metadata = {
    title: "GeckoAI - TailLink",
    description: "Your semester, built seamlessly.",
};

export default function TailLink() {
    return (
        <>
            <TailLinkPage />
        </>
    );
}
