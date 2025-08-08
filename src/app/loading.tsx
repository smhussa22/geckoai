"use client";
import React from "react";

export default function Loading() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-night text-asparagus">
      <div className="animate-spin h-10 w-10 border-4 border-asparagus border-t-transparent rounded-full" />
    </div>
  );
}
