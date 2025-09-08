"use client";
import React from "react";
import PrimaryBadge from "./PrimaryBadge";
import CalendarQuickActions from "./CalendarQuickActions";
import ViewToggle, { type ViewMode } from "./ViewToggle";
import ReactBigCalendar from "./ReactBigCalendar";

type Props = {
  name: string;
  description?: string;
  isPrimary: boolean;
  view: ViewMode;
  onChangeView: (v: ViewMode) => void;
};

export default function TailLinkCalendar({
  name,
  description,
  isPrimary,
  view,
  onChangeView,
}: Props) {

  return (

    <div className="h-full flex flex-col">

      <div className="flex items-center justify-between border rounded-md mb-1 shadow-md border-neutral-700">

        <div className="flex items-center gap-4 px-2">

          <div className="p-2">

            <div className="flex gap-2 items-center">

              <h1 className="text-xl font-bold tracking-tighter text-asparagus">{name}</h1>
              <PrimaryBadge size={20} show={isPrimary} className="mt-0.5" />

            </div>

            {description ? <h2 className="font-semibold tracking-tighter text-broccoli">{description}</h2> : null}

          </div>

          <ViewToggle view={view} onChange={onChangeView} className="shrink-0" />

        </div>

        <div className="relative flex items-center my-2 mr-2">

          <CalendarQuickActions
            isPrimary={isPrimary}
            onCreateEvent={() => {}}
            onSearchEvents={() => {}}
            onOpenSettings={() => {}}
            onDeleteCalendar={() => {}}
            onClearChat={() => {}}
          />

        </div>

      </div>

      <div className="flex-1 rounded-md border border-neutral-800 bg-neutral-900 flex items-center justify-center">
          
          <ReactBigCalendar/> 

      </div>

    </div>

  );
  
}
