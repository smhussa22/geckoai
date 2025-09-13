'use client';
import { TbCalendarQuestion } from 'react-icons/tb';

import React from 'react';

export default function TailLinkEmptyState() {
  return (
    <>
      <div className="absolute top-[50%] left-[50%] flex w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
        <TbCalendarQuestion size={75} color="#404040" />
        <span className="text-xl font-semibold text-neutral-700">
          Click on a calendar to get started
        </span>
      </div>
    </>
  );
}
