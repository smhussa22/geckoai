"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { routeMetadata } from "../routeMetadata";
import { Tooltip } from "react-tooltip";
import { useUser } from "../contexts/UserContext";
import AccountDropDown from "./AccountDropdown";
import Link from "next/link";
import StorageBar from "./StorageBar";

export default function Header() {
    const pathName = usePathname();
    const metadataKey = pathName.split("/").filter(Boolean)[0];
    const metadata = routeMetadata[metadataKey];

    const [logOutMenu, setLogOutMenu] = useState(false);
    const { user } = useUser();
    const name = user?.firstName ?? "GeckoAI User";
    const initial = name.charAt(0).toUpperCase();
    const email = user?.email ?? "geckoaiuser@geckoai.com";
    const picture = user?.picture ?? null;

    return (
        <>
            <div className="relative z-10 flex w-full items-center border-b border-b-neutral-800 px-4 py-3 tracking-tighter shadow-md">
                <div>
                    <h1 className="text-asparagus text-2xl font-semibold">{metadata.title}</h1>
                    <p className="text-broccoli ml-0.5">{metadata.subTitle}</p>
                </div>

                <div className="ml-auto flex gap-6">
                    <StorageBar />

                    <Link
                        href="/plus"
                        className="hover:bg-night hover:text-asparagus bg-asparagus flex cursor-pointer items-center rounded-md px-5 font-semibold tracking-tighter shadow-md transition-colors"
                    >
                        Upgrade
                    </Link>

                    <button
                        onClick={() => setLogOutMenu(!logOutMenu)}
                        data-tooltip-id="gmailIcon"
                        className="bg-asparagus flex aspect-square w-12 cursor-pointer items-center justify-center overflow-hidden rounded-full"
                    >
                        {picture ? (
                            <img
                                src={picture}
                                draggable="false"
                                alt="Profile"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-night text-xl font-bold">{initial}</span>
                        )}
                    </button>
                </div>

                <AccountDropDown open={logOutMenu} />

                {!logOutMenu && (
                    <Tooltip
                        id="gmailIcon"
                        place="bottom"
                        opacity={1}
                        style={{ backgroundColor: "#262626", borderRadius: "0.375rem" }}
                        noArrow
                        delayShow={0}
                        delayHide={0}
                    >
                        <div className="text-asparagus flex flex-col tracking-tighter">
                            <h1 className="text-ghost">Google Account</h1>
                            <h1 className="text-asparagus">{name}</h1>
                            <h1 className="text-asparagus">{email}</h1>
                        </div>
                    </Tooltip>
                )}
            </div>
        </>
    );
}
