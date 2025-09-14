'use client';
import React from 'react';
import { SlSocialDropbox } from 'react-icons/sl';

export default function DragActive() {

  return (
    
    <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center rounded-md border-2 border-dashed border-asparagus/60 bg-asparagus/10 mb-1">
      <div className="text-asparagus relative flex flex-col items-center font-bold tracking-tighter">
        <SlSocialDropbox className="mb-4" size={80} />
        <h1 className="text-2xl">Drop files to upload</h1>
        <h2 className="mt-1 text-center text-sm font-semibold">
          Accepted: PDFs, text (.txt), images (.png/.jpg/.jpeg/.webp), and PowerPoint (.pptx)
        </h2>
      </div>
    </div>
  );
}
