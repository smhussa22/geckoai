'use client';
import React from 'react';
import RightPanel from './RightPanel';
import LeftPanel from './LeftPanel';

export default function TailLinkPage() {
  return (
    <>
      <div className="flex h-full flex-row gap-4 p-4">
        <LeftPanel />
        <RightPanel />
      </div>
    </>
  );
}
