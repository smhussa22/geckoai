"use client";
import React from "react";
import { MdPerson } from "react-icons/md";
import { Tooltip } from "react-tooltip";

type PrimaryBadgeProps = {
  show: boolean;                // render only when true
  tooltipId?: string;
  size?: number;
  className?: string;
};

export default function PrimaryBadge({ show, tooltipId = "primary-crown", size = 24, className = ""}: PrimaryBadgeProps) {
  
    if (!show) return null;

    return (
        <>
        
        <MdPerson
            data-tooltip-id={tooltipId}
            size={size}
            className={`text-neutral-700 hover:text-neutral-600 transition-colors duration-300 ${className}`}
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
