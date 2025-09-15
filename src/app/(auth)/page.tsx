"use client";
import React from "react";
import { FaGoogle } from "react-icons/fa";
import { useUser } from "../contexts/UserContext";

export default function HomePage() {
    const { GoogleLogIn } = useUser();

    return (
        <div className="relative flex h-screen items-center justify-center overflow-hidden">
            <div className="pointer-events-none absolute inset-0" />

            <div className="relative w-full max-w-md">
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/65 p-6 shadow-xl">
                    <div className="space-y-1 text-center">
                        <h1 className="text-asparagus text-3xl font-semibold">Welcome back!</h1>

                        <p className="text-sm text-neutral-400">
                            Continue with Google to start planning and quizzing faster.
                        </p>
                    </div>

                    <ul className="mt-4 space-y-1 text-sm text-neutral-400">
                        <li>• Sync hundreds of events to your Google Calendar</li>
                        <li>• Create interactive quizzes from your study materials</li>
                        <li>• Save chats and preferences across devices</li>
                    </ul>

                    <hr className="my-5 h-px border-neutral-800" />

                    <button
                        onClick={GoogleLogIn}
                        className="bg-broccoli text-night hover:bg-night hover:text-broccoli inline-flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-800 py-3 font-semibold transition-colors"
                    >
                        <FaGoogle className="text-lg" /> Continue with Google
                    </button>

                    <p className="mt-3 text-center text-xs text-neutral-500">
                        GeckoAI currently supports Google accounts only.
                    </p>
                </div>
            </div>
        </div>
    );
}
