import React from "react";

export default function StorageTracker() {

    const usedStorage = 25;
    const allowedStorage = 100;
    const storageUnit = "MB";
    const percentage = Math.min((usedStorage / allowedStorage) * 100, 100);

    return (

        <div className="flex flex-col gap-2 w-64">

            <div className="flex font-bold tracking-tighter justify-between text-ghost">

                <span>Cloud Storage</span>

                <span>

                    {usedStorage} / {allowedStorage} {storageUnit}

                </span>

            </div>

            <div className="w-full h-4 bg-neutral-800 rounded-full border border-neutral-700 overflow-hidden">
                
                <div
                className="h-full bg-asparagus rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
                />

            </div>

        </div>

    );
}
