// the sidebar that has the toolbox of components/utilities. collapsible
"use client";
import React from "react";
import { useState, useRef } from "react";
import Logo from "../components/Logo";
import SidebarItem from "./SidebarItem";
import { motion } from "framer-motion";
import { IoChatbubblesOutline } from "react-icons/io5";
import { TbCalendarShare } from "react-icons/tb";
import { LuSettings } from "react-icons/lu";
import { RxQuestionMarkCircled } from "react-icons/rx";

const itemIconProps = {
    // holding identical properties in an object and using ... to spread across all of required components

    size: 30,
    className: "p-0.5 ml-0.5 my-1 transition-colors duration-300",
    color: "currentColor",
};

// @todo switch to react icons

const staticIcons = {
    calendar: <TbCalendarShare {...itemIconProps} />,
    settings: <LuSettings {...itemIconProps} />,
    help: <RxQuestionMarkCircled {...itemIconProps} />,
    chat: <IoChatbubblesOutline {...itemIconProps} />,
};

export default function SidebarDiv() {
    const [isExpanded, toggleExpand] = useState(false);
    const iconsRef = useRef(staticIcons);

    // @todo: add tracking tighter when it doesnt cover up the text slightly

    return (
        <>
            <aside className="h-screen">
                {/* @todo remove unnecessary framer motion */}
                <motion.nav
                    animate={{ width: isExpanded ? `14.5rem` : `3.75rem` }}
                    transition={{ duration: 0.3 }}
                    className={`bg-night flex h-full flex-col border-r border-r-neutral-800 shadow-md`}
                >
                    {/* make the logo the button to toggle side bar */}
                    <div className="flex h-16 items-center justify-between">
                        <button
                            onClick={() => toggleExpand(!isExpanded)}
                            className="ml-1.25 cursor-pointer"
                        >
                            <div>
                                <Logo
                                    logoColor={isExpanded ? "#698f3f" : "#384f1f"}
                                    className="w-12 rounded-lg p-1.5 transition-transform duration-100 hover:scale-[1.1] hover:bg-neutral-800"
                                />
                            </div>
                        </button>
                    </div>

                    <ul className="flex-1 px-3 py-4">
                        {" "}
                        {/* flex-1 makes this take up the rest of the space of the div*/}{" "}
                        {/*TODO: make a mapping config for the sidebar items for easier scalability*/}
                        <SidebarItem
                            buttonIcon={iconsRef.current.calendar}
                            isExpanded={isExpanded}
                            buttonRoute="/taillink"
                            buttonText="TailLink"
                        />
                        <hr className="my-3 border-neutral-800" />
                        <SidebarItem
                            buttonIcon={iconsRef.current.settings}
                            isExpanded={isExpanded}
                            buttonRoute="/settings"
                            buttonText="Settings"
                        />
                        <SidebarItem
                            buttonIcon={iconsRef.current.help}
                            isExpanded={isExpanded}
                            buttonRoute="/help"
                            buttonText="Help"
                        />
                    </ul>
                </motion.nav>
            </aside>
        </>
    );
}
