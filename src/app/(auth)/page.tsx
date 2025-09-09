'use client';
import React from 'react';
import { FaGoogle } from "react-icons/fa";
import { useUser } from '../contexts/UserContext';

export default function HomePage() {
  
  const { GoogleLogIn } = useUser();

  return (

    <div className="h-screen overflow-hidden flex items-center justify-center relative">

      <div className="pointer-events-none absolute inset-0" />

      <div className="w-full max-w-md relative">

        <div className="bg-neutral-900/65 border border-neutral-800 rounded-2xl shadow-xl p-6">
        
          <div className="text-center space-y-1">
        
            <h1 className="text-asparagus text-3xl font-semibold">Welcome back!</h1>

            <p className="text-neutral-400 text-sm">

              Continue with Google to start planning and quizzing faster.

            </p>

          </div>

          <ul className="mt-4 space-y-1 text-sm text-neutral-400">
            
            <li>• Sync hundreds of events to your Google Calendar</li>
            <li>• Create interactive quizzes from your study materials</li>
            <li>• Save chats and preferences across devices</li>

          </ul>

          <hr className="my-5 h-px border-neutral-800"/>


          <button
            onClick={GoogleLogIn}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-broccoli text-night font-semibold py-3 hover:bg-night hover:text-broccoli transition-colors"
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
