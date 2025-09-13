'use client';
import { useEffect, useState } from 'react';
import React from 'react';

export default function StorageTracker() {
  const [storage, setStorage] = useState<null | {
    bytes: { used: number; limit: number; remaining: number };
    formatted: { used: string; limit: string; remaining: string; percentUsed: number };
  }>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/me/storage', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setStorage(data);
        }
      } catch (error) {
        console.error('Failed to load storage:', error);
      }
    })();
  }, []);

  if (!storage) {
    return (
      <div className="flex w-64 flex-col gap-2">
        <div className="text-ghost flex justify-between font-bold tracking-tighter">
          <span>Cloud Storage</span>
          <span className="text-neutral-400">Loading…</span>
        </div>

        <div className="h-4 w-full overflow-hidden rounded-full border border-neutral-700 bg-neutral-800">
          <div className="h-full w-20 animate-pulse rounded-full bg-neutral-600" />
        </div>
      </div>
    );
  }

  const { formatted } = storage;
  console.log(formatted.percentUsed);

  return (
    <div className="flex w-64 flex-col gap-2">
      <div className="text-ghost flex justify-between font-bold tracking-tighter">
        <span>Cloud Storage</span>
        <span>
          {formatted.used} / {formatted.limit}
        </span>
      </div>

      <div className="h-4 w-full overflow-hidden rounded-full border border-neutral-700 bg-neutral-800">
        <div
          className={`bg-asparagus h-full rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(formatted.percentUsed, 100)}%` }}
        />
      </div>
    </div>
  );
}
