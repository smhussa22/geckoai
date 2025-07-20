// logo as an svg component (i could not get webpack to work)
"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Logo from './Logo';
import SidebarItem from './SidebarItem';
import { CalendarPlus, BrainCircuit, Settings, CircleQuestionMark } from 'lucide-react';


export default function SidebarLayout() {

  return (

    <>

        <Sidebar sidebar_user_icon="" sidebar_user_name="GeckoAI User" sidebar_user_email="geckoai@geckoai.com">

            <SidebarItem button_text_color="asparagus" button_icon={<CalendarPlus color="#698f3f" size={30} className='p-0.5 ml-0.5'/>} button_route="/taillink" button_text="TailLink" />
            <SidebarItem button_text_color="asparagus" button_icon={<BrainCircuit color="#698f3f" size={30} className='p-0.5 ml-0.5' />} button_route="/quizscale" button_text="QuizScale" />

            <hr className="my-3 border-neutral-800" />

            <SidebarItem button_text_color="asparagus" button_icon={<Settings color="#698f3f" size={30} className='p-0.5 ml-0.5' />} button_route="/settings" button_text="Settings" />
            <SidebarItem button_text_color="asparagus" button_icon={<CircleQuestionMark color="#698f3f" size={30} className='p-0.5 ml-0.5' />} button_route="/help" button_text="Help" />

        </Sidebar>

    </>

  );

}
