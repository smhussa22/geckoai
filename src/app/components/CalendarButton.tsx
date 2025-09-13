'use client';
import React from 'react';

type ButtonProps = {
  name: string;
  icon: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
  selected: boolean;
  onClick: () => void;
};

const defaultBackground = '#698f3f';
const defaultForeground = '#000000';

export default function CalendarButton({
  onClick,
  name,
  icon,
  backgroundColor = defaultBackground,
  textColor,
  selected,
}: ButtonProps) {
  const foreground = textColor || defaultForeground;

  return (
    <button
      onClick={onClick}
      className={`flex w-full flex-row rounded-md transition-all duration-200 hover:scale-105 ${
        !selected && 'opacity-75'
      }`}
      style={{ backgroundColor, color: foreground }}
      title={name}
    >
      <div className="flex w-56 flex-row items-center gap-2 p-1">
        <span className="shrink-0">{icon}</span>

        <span
          className="text-medium block overflow-hidden font-semibold tracking-tighter text-ellipsis whitespace-nowrap"
          style={{ color: foreground }}
        >
          {name}
        </span>
      </div>
    </button>
  );
}
