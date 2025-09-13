import React from 'react';

export default function AIChatIcon() {
  return (
    <div className="mb-4 flex justify-start">
      <div className="flex w-[30%] animate-pulse items-start gap-5 tracking-tighter">
        <img src="/logoAnimated.svg" alt="AI" className="h-11 w-11 shrink-0 rounded-full p-1.5" />

        <div className="mt-3 flex flex-1 flex-col gap-1.5">
          <div className="via-broccoli animate-[loading_5.5s_infinite] rounded-md bg-gradient-to-r from-neutral-800 to-neutral-800 bg-[length:200%_100%] p-2.5" />
          <div className="via-broccoli animate-[loading_5.5s_infinite] rounded-md bg-gradient-to-r from-neutral-800 to-neutral-800 bg-[length:200%_100%] p-2.5" />
          <div className="via-broccoli w-3/5 animate-[loading_5.5s_infinite] rounded-md bg-gradient-to-r from-neutral-800 to-neutral-800 bg-[length:200%_100%] p-2.5" />
        </div>
      </div>
    </div>
  );
}
