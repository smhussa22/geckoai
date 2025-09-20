"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Tooltip } from "react-tooltip";
import { RiArrowDropUpLine, RiArrowDropDownLine } from "react-icons/ri";

export default function NavBar() {
    const regularLinks = ["Home", "Plus"];

    const dropDownLinks = [
        {
            id: "support-menu",
            label: "Support",
            items: [
                { label: "Help Center", href: "/support" },
                { label: "Contact", href: "/contact" },
                { label: "Server Status", href: "/status" },
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms of Service", href: "/terms" },
            ],
        },

        {
            id: "resources",
            label: "Resources",
            items: [
                { label: "Developer Logs", href: "/support" },
                { label: "Source Code & Technologies", href: "/technologies" },
            ],
        },
    ];

    const toPath = (label: string) =>
        label.toLowerCase() === "home" ? "/" : `/${label.toLowerCase()}`;

    const [openId, setOpenId] = useState<string | null>(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 0);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <nav
            className={`sticky top-0 z-50 h-fit w-full border-b border-b-neutral-800 p-4 ${scrolled ? "backdrop-blur" : "bg-transparent"}`}
        >
            <div className="grid grid-cols-3 items-center">
                <Link href="/" className={`text-asparagus flex items-center gap-2`}>
                    <img src="/logoAnimated.svg" alt="GeckoAI Logo" className="h-12 w-12" />
                    <h1 className="text-4xl font-extrabold tracking-tighter">GeckoAI</h1>
                </Link>

                <ul className="flex items-center justify-center gap-2 tracking-tighter">
                    {regularLinks.map((label) => (
                        <li key={label}>
                            <Link
                                href={toPath(label)}
                                className={`focus-visible:ring-broccoli text-asparagus hover:bg-asparagus hover:text-night rounded-md px-3 py-1 font-bold select-none focus:outline-none focus-visible:ring-2`}
                            >
                                {label}
                            </Link>
                        </li>
                    ))}

                    {dropDownLinks.map((dropDown) => (
                        <li key={dropDown.id} className="relative inline-block">
                            <Link
                                href={`/${dropDown.label.toLowerCase()}`}
                                data-tooltip-id={dropDown.id}
                                onMouseEnter={() => setOpenId(dropDown.id)}
                                className={`group focus-visible:ring-broccoli flex cursor-pointer items-center gap-0.5 rounded-md px-3 py-1 font-bold select-none focus:outline-none focus-visible:ring-2 ${openId === dropDown.id ? "bg-asparagus text-night" : "text-asparagus hover:bg-asparagus hover:text-night"}`}
                            >
                                {dropDown.label}

                                {openId === dropDown.id ? (
                                    <RiArrowDropDownLine className="text-xl" />
                                ) : (
                                    <RiArrowDropUpLine className="text-xl" />
                                )}
                            </Link>

                            <Tooltip
                                id={dropDown.id}
                                clickable
                                isOpen={openId === dropDown.id}
                                setIsOpen={(v) => setOpenId(v ? dropDown.id : null)}
                                place="bottom"
                                offset={4}
                                noArrow
                                opacity={100}
                                className="!bg-asparagus !rounded-lg !p-2 !shadow-xl"
                                delayShow={0}
                                delayHide={0}
                            >
                                <div
                                    id={dropDown.id}
                                    onMouseEnter={() => setOpenId(dropDown.id)}
                                    onMouseLeave={() =>
                                        setOpenId((cur) => (cur === dropDown.id ? null : cur))
                                    }
                                    className="w-fit"
                                >
                                    <ul className="flex flex-col">
                                        {dropDown.items.map((item) => (
                                            <li key={item.label}>
                                                <Link
                                                    href={item.href}
                                                    className="text-night flex flex-col px-3 py-2 font-bold transition-colors duration-150 hover:text-neutral-800"
                                                >
                                                    {item.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Tooltip>
                        </li>
                    ))}
                </ul>

                <div className="flex justify-end">
                    <Link
                        href="/login"
                        className={`text-night hover:bg-night hover:text-broccoli bg-broccoli rounded-md border border-neutral-800 px-8 py-1.5 text-2xl font-bold tracking-tighter transition-colors`}
                    >
                        Log In
                    </Link>
                </div>
            </div>
        </nav>
    );
}
