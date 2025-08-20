// app/components/NavBar.tsx
"use client";
import React, { useEffect, useState } from "react";
import Logo from "./Logo";
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
        { label: "Source Code & Technologies", href: "/technologies"},
      ],
    },

  ];

  const toPath = (label: string) => label.toLowerCase() === "home" ? "/" : `/${label.toLowerCase()}`;

  const [openId, setOpenId] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {

    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);

  }, []);

  return (

    <nav className={`w-full h-fit border-b p-4 sticky top-0 z-50 border-b-neutral-800 ${scrolled ? "backdrop-blur-md" : "bg-transparent"}`}>

      <div className="grid grid-cols-3 items-center">

        <Link href="/" className={`flex items-center gap-2 text-asparagus`}>

          <Logo logoColor={"#698f3f"} className="w-12 h-12" />
          <h1 className="tracking-tighter text-4xl font-extrabold">GeckoAI</h1>

        </Link>

        <ul className="flex items-center justify-center gap-2 tracking-tighter">

          {regularLinks.map((label) => (

            <li key={label}>

              <Link href={toPath(label)} className={`font-bold rounded-md px-3 py-1 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-broccoli select-none text-asparagus hover:bg-asparagus hover:text-night`}>
                {label}
              </Link>

            </li>

          ))}

          {dropDownLinks.map((dropDown) => (

            <li key={dropDown.id} className="relative inline-block after:content-[''] after:absolute after:left-0 after:top-full after:w-full after:h-2">

              <Link href={`/${dropDown.label.toLowerCase()}`} data-tooltip-id={dropDown.id} onMouseEnter={() => setOpenId(dropDown.id)} className={`font-bold group flex items-center gap-0.5 cursor-pointer rounded-md px-3 py-1 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-broccoli select-none ${openId === dropDown.id ? "bg-asparagus text-night" : "text-asparagus hover:bg-asparagus hover:text-night"}`}>
                
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
                className="!bg-asparagus !p-2 !rounded-lg !shadow-xl"

              >
                <div id={dropDown.id} onMouseEnter={() => setOpenId(dropDown.id)} onMouseLeave={() => setOpenId((cur) => (cur === dropDown.id ? null : cur))} className="min-w-[12rem]">

                  <ul className="flex flex-col">

                    {dropDown.items.map((item) => (

                      <li key={item.label}>

                        <Link href={item.href} className="flex flex-col px-3 py-2 text-night font-bold hover:text-neutral-800 transition-colors duration-150">
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

          <Link href="/login" className={`text-2xl border rounded-md py-1.5 px-8 font-bold tracking-tighter transition-colors text-night border-neutral-800 hover:bg-night hover:text-broccoli bg-broccoli`}>
            Log In
          </Link>

        </div>

      </div>

    </nav>

  );

}
