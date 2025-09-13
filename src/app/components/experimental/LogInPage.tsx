'use client';
import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// @todo: make the background move with actual forests and animals lizard blink gecko blink ladybug jungle leaves ~ minagi

export default function LogInPage() {
  const [show_password, set_show_password] = useState(false);

  return (
    <>
      <div className="relative z-0 flex h-screen">
        <div className="bg-night absolute top-[50%] left-[50%] z-1 h-90 w-125 -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-lg">
          <div className="justify-items-center p-4">
            <h1 className="text-asparagus text-2xl font-semibold">Welcome back!</h1>
            <h2 className="text-asparagus">Log in to begin using GeckoAI!</h2>

            <div>
              <h3 className="text-asparagus py-1 font-bold">Gmail:</h3>

              <div className="flex justify-center">
                <input
                  type="email"
                  className="focus:ring-asparagus text-asparagus h-10 w-1/1 rounded-lg border border-neutral-700 bg-neutral-800 pl-2 focus:ring-1 focus:outline-none"
                />
              </div>

              <h3 className="text-asparagus py-1 font-bold">Password:</h3>

              <div className="relative flex justify-center">
                <input
                  type={show_password ? 'text' : 'password'}
                  className="focus:ring-asparagus text-asparagus h-10 w-1/1 rounded-lg border border-neutral-700 bg-neutral-800 pl-2 focus:ring-1 focus:outline-none"
                />

                <AnimatePresence mode="wait" initial={false}>
                  <motion.button
                    key={show_password ? 'eye-off' : 'eye'}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                    type="button"
                    onClick={() => set_show_password(!show_password)}
                    className="text-asparagus absolute top-1/2 right-3 -translate-y-1/2"
                  >
                    {show_password ? (
                      <EyeOff color={'#525252'} size={20} />
                    ) : (
                      <Eye color={'#525252'} size={20} />
                    )}
                  </motion.button>
                </AnimatePresence>
              </div>

              <div className="mt-1">
                <Link href="/" className="text-asparagus text-sm font-semibold hover:underline">
                  Forgot your password?
                </Link>
              </div>

              <div className="mt-2">
                <button className="hover:bg-night hover:text-broccoli bg-broccoli text-night h-15 w-100 cursor-pointer rounded-lg border border-neutral-800 p-2 text-3xl font-bold transition-colors duration-150">
                  Log In
                </button>
              </div>

              <div className="mt-1">
                <Link
                  href="/register"
                  className="text-asparagus text-sm font-semibold hover:underline"
                >
                  Don't have an account? Register!
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
