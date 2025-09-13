import React from 'react';
import { SlSocialDropbox } from 'react-icons/sl';
export default function DragActive() {
  return (
    <>
      <div className="bg-asparagus/30 pointer-events-none absolute z-100 flex h-239 w-435 -translate-x-1/140 -translate-y-1/75 items-center justify-center rounded-md">
        <div className="text-night relative flex flex-col items-center justify-center font-bold tracking-tighter">
          <SlSocialDropbox className="absolute bottom-20" size={80} />
          <h1 className="text-2xl">Drag Files!</h1>
          <h2>Note: PDFs, documents, text files, images, and presentations are accepted.</h2>
        </div>
      </div>
    </>
  );
}
