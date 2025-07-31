// the sidebar that has the toolbox of components/utilities. collapsible
'use client';
import React from 'react';
import { useState, useMemo } from 'react';
import Logo from '../components/Logo';
import SidebarItem from './SidebarItem';
import { MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { CalendarPlus, BrainCircuit, Settings, CircleQuestionMark } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useUser } from '@/lib/firebase_auth';

const item_icon_props = { // holding identical properties in an object and using ... to spread across all of required components

  size: 30,
  className: 'p-0.5 ml-0.5 my-1 transition-colors duration-300',
  color: "currentColor"

}


export default function SidebarDiv() {

  const path_name = usePathname();
  const [is_expanded, toggle_expand] = useState(false);
  const user = useUser();

  return (

    <>

      <aside className = "h-screen"> {/* give it full viewport height */}

        {/* nav bar div; make it flex so the item list can take up the rest of the space*/}
        <motion.nav animate = { { width: is_expanded ? `14.5rem` : `3.75rem` } } transition = { { duration: 0.3 } } className = {`h-full flex flex-col bg-night border-r border-r-neutral-800 shadow-sm`}> 

          {/* make the logo the button to toggle side bar */}
          <div className = "h-16 flex justify-between items-center"> 

            <button onClick = {() => toggle_expand(!is_expanded)} className = "ml-1.25 cursor-pointer">

              <div >

                <Logo logo_color = {is_expanded ? "#698f3f" : "#384f1f"} className = "transition-transform duration-100 hover:scale-[1.1] w-12 p-1.5 hover:bg-neutral-800 rounded-lg"/>
              
              </div>

            </button>

          </div>
        
          <ul className = "flex-1 px-3"> {/* flex-1 makes this take up the rest of the space of the div*/} {/*TODO: make a mapping config for the sidebar items for easier scalability*/}

          
            <SidebarItem button_icon={<CalendarPlus {...item_icon_props} />} is_expanded = {is_expanded} button_route="/taillink" button_text="TailLink" />
            <SidebarItem button_icon= {<BrainCircuit {...item_icon_props} />} is_expanded = {is_expanded} button_route="/quizscale" button_text="QuizScale" /> 
            
            <hr className="my-3 border-neutral-800" />
            
            <SidebarItem button_icon={<Settings {...item_icon_props} />} is_expanded = {is_expanded} button_route="/settings" button_text="Settings" /> 
            <SidebarItem button_icon={<CircleQuestionMark {...item_icon_props} />}  is_expanded = {is_expanded} button_route="/help" button_text="Help" />
            
          </ul>


        </motion.nav>
    
      </aside>
        
    </>

  );

}
