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
        <div className="flex h-full flex-col">
            <div className="mb-1 flex items-center justify-between rounded-md border border-neutral-700 shadow-md">
                <div className="flex items-center gap-4 px-2">
                    <div className="p-2">
                        <div className="flex items-center gap-2">
                            <h1 className="text-asparagus text-xl font-bold tracking-tighter">
                                {name}
                            </h1>
                            <PrimaryBadge size={20} show={isPrimary} className="mt-0.5" />
                        </div>

                        {description ? (
                            <h2 className="text-broccoli font-semibold tracking-tighter">
                                {description}
                            </h2>
                        ) : null}
                    </div>

                    <ViewToggle view={view} onChange={onChangeView} className="shrink-0" />
                </div>

                <div className="relative my-2 mr-2 flex items-center">
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

            <div className="flex flex-1 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900">
                <ReactBigCalendar />
            </div>
        </div>
    );
}
