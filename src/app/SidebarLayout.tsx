"use client";
import React from 'react';
import Sidebar from './Sidebar';
import SidebarItem from './SidebarItem';
import { CalendarPlus, BrainCircuit, Settings, CircleQuestionMark } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function SidebarLayout() {

  const path_name = usePathname();

  const icon_props = { // holding identical properties in an object and using ... to spread across all of required components

    size: 30,
    className: 'transition-colors duration-300 p-0.5 ml-0.5'

  }

  return (

    <>

        <Sidebar sidebar_user_icon="" sidebar_user_name="GeckoAI User" sidebar_user_email="geckoai@geckoai.com">

            <SidebarItem button_icon={(color) => <CalendarPlus color={color} {...icon_props}/>} button_route="/taillink" button_text="TailLink" />
            <SidebarItem button_icon={(color) => <BrainCircuit color={color} {...icon_props} />} button_route="/quizscale" button_text="QuizScale" />

            <hr className="my-3 border-neutral-800" />

            <SidebarItem button_icon={(color) => <Settings color={color} {...icon_props} />} button_route="/settings" button_text="Settings" />
            <SidebarItem button_icon={(color) => <CircleQuestionMark color={color} {...icon_props} />} button_route="/help" button_text="Help" />

        </Sidebar>

    </>

  );

}
