"use client";
import React from "react";
import { GoVerified } from "react-icons/go";
import { Tooltip } from "react-tooltip";

type PrimaryBadgeProps = {
    show: boolean;
    tooltipId?: string;
    size?: number;
    className?: string;
};

export default function PrimaryBadge({
    show,
    tooltipId = "primary-crown",
    size = 28,
    className,
}: PrimaryBadgeProps) {
    if (!show) return null;

    return (
        <>
            <GoVerified
                data-tooltip-id={tooltipId}
                size={size}
                className={`text-neutral-700 transition-colors duration-300 hover:text-neutral-600 ${className}`}
            />

            <Tooltip
                id={tooltipId}
                place="right"
                opacity={1}
                content="This is your primary calendar. It can not be deleted, but its events may be cleared."
                style={{
                    backgroundColor: "#262626",
                    padding: "0.4rem",
                    borderRadius: "0.375rem",
                    color: "#698f3f",
                    letterSpacing: "-0.05em",
                    zIndex: 50,
                }}
                noArrow
                delayShow={50}
                delayHide={0}
            />
        </>
    );
}
