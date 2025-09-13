import React from 'react';
import Link from 'next/link';
import './globals.css';

export default function Custom404() {
  return (
    <>
      <div className="relative flex h-screen">
        <div className="bg-night absolute top-[50%] left-[50%] z-1 -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-lg">
          <div className="flex flex-col p-4">
            <div className="justify-items-center">
              <h1 className="text-asparagus text-2xl font-semibold">Error: 404</h1>
              <h2 className="text-asparagus">This page could not be found</h2>
            </div>

            <Link
              className="hover:bg-night hover:text-broccoli bg-broccoli text-night my-2 flex h-15 w-100 cursor-pointer items-center justify-center rounded-lg border border-neutral-800 p-2 text-3xl font-bold transition-colors duration-150"
              href="/"
            >
              Return To Login
            </Link>
            <Link
              className="hover:bg-night hover:text-broccoli bg-broccoli text-night flex h-15 w-100 cursor-pointer items-center justify-center rounded-lg border border-neutral-800 p-2 text-3xl font-bold transition-colors duration-150"
              href="/taillink"
            >
              Return To Dashboard
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
