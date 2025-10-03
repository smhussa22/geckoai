"use client";
import React from "react";
import { AiOutlineUserSwitch } from "react-icons/ai";
import { VscSignOut } from "react-icons/vsc";
import { useUser } from "../contexts/UserContext";

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function AccountDropDown({ open, onClose }: Props) {
    const { user, GoogleLogIn, GoogleLogOut } = useUser();

    if (!open) return null;

    return (
        <>
            {/* Overlay behind dropdown to catch outside clicks */}
            <div className="fixed inset-0 z-40" onClick={onClose} />

            {/* Dropdown itself, pinned to top-right */}
            <div
                className="absolute top-24 right-3 z-50 flex flex-col items-center gap-3 rounded-md border border-neutral-400 bg-ghost p-4 tracking-tighter shadow-lg"
                onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
            >
                <h1 className="text-sm font-medium">{user?.email}</h1>

                {user?.picture && (
                    <img
                        src={user.picture}
                        alt="Profile"
                        draggable="false"
                        className="h-auto w-22 rounded-full"
                    />
                )}

                <h1 className="text-xl">
                    Hello,{" "}
                    <span className="text-xl font-medium tracking-tighter">{user?.firstName}!</span>
                </h1>

                <button
                    onClick={() => {
                        GoogleLogOut();
                        onClose();
                    }}
                    className="text-night flex w-full cursor-pointer flex-row items-center rounded-md border border-neutral-400 p-1.5 transition-colors duration-150 hover:bg-gray-300"
                >
                    <VscSignOut className="ml-1" size={24} />
                    <span className="pl-8">Log Out</span>
                </button>

                <button
                    onClick={() => {
                        GoogleLogIn();
                        onClose();
                    }}
                    className="text-night flex w-full cursor-pointer flex-row items-center rounded-md border border-neutral-400 p-1.5 transition-colors duration-150 hover:bg-gray-300"
                >
                    <AiOutlineUserSwitch className="ml-1" size={24} />
                    <span className="pl-1.5">Switch Accounts</span>
                </button>
            </div>
        </>
    );
}
