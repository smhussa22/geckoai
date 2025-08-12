// the sidebar that has the toolbox of components/utilities. collapsible
'use client';
import React from 'react';
import { useState, useRef } from 'react';
import Logo from '../components/Logo';
import SidebarItem from './SidebarItem';
import { motion } from 'framer-motion';
import { CalendarPlus, BrainCircuit, Settings, CircleQuestionMark } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { IoChatbubblesOutline } from "react-icons/io5";

const itemIconProps = { // holding identical properties in an object and using ... to spread across all of required components

  size: 30,
  className: 'p-0.5 ml-0.5 my-1 transition-colors duration-300',
  color: "currentColor"

}

// @todo switch to react icons

const staticIcons = {

  calendar: <CalendarPlus {...itemIconProps} />,
  brain: <BrainCircuit {...itemIconProps} />,
  settings: <Settings {...itemIconProps} />,
  help: <CircleQuestionMark {...itemIconProps} />,
  chat: <IoChatbubblesOutline {...itemIconProps} />

}
export default function SidebarDiv() {

  const pathName = usePathname();
  const [isExpanded, toggleExpand] = useState(false);
  const iconsRef = useRef(staticIcons);

  return (

    <>

      <aside className = "h-screen"> 

        {/* @todo remove unnecessary framer motion */}
        <motion.nav animate = { { width: isExpanded ? `14.5rem` : `3.75rem` } } transition = { { duration: 0.3 } } className = {`h-full flex flex-col bg-night border-r border-r-neutral-800 shadow-md`}> 

          {/* make the logo the button to toggle side bar */}
          <div className = "h-16 flex justify-between items-center"> 

            <button onClick = {() => toggleExpand(!isExpanded)} className = "ml-1.25 cursor-pointer">

              <div >

                <Logo logoColor = {isExpanded ? "#698f3f" : "#384f1f"} className = "transition-transform duration-100 hover:scale-[1.1] w-12 p-1.5 hover:bg-neutral-800 rounded-lg"/>
              
              </div>

            </button>

          </div>
        
          <ul className = "flex-1 px-3 py-4"> {/* flex-1 makes this take up the rest of the space of the div*/} {/*TODO: make a mapping config for the sidebar items for easier scalability*/}

            <SidebarItem buttonIcon={iconsRef.current.calendar} isExpanded={isExpanded} buttonRoute="/taillink" buttonText="TailLink" />
            <SidebarItem buttonIcon={iconsRef.current.brain} isExpanded={isExpanded} buttonRoute="/quizscale" buttonText="QuizScale" />
            
            <hr className="my-3 border-neutral-800" />

            <SidebarItem buttonIcon={iconsRef.current.settings} isExpanded={isExpanded} buttonRoute="/settings" buttonText="Settings" />
            <SidebarItem buttonIcon={iconsRef.current.help} isExpanded={isExpanded} buttonRoute="/help" buttonText="Help" />
            
          </ul>

        </motion.nav>
    
      </aside>
        
    </>

  );

}
