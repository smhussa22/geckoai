// the sidebar that has the toolbox of components/utilities. collapsible
'use client';
import React from 'react';
import { useState } from 'react';
import Logo from './Logo';
import SidebarItem from './SidebarItem';
import { MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { CalendarPlus, BrainCircuit, Settings, CircleQuestionMark } from 'lucide-react';
import { usePathname } from 'next/navigation';

const item_icon_props = { // holding identical properties in an object and using ... to spread across all of required components

  size: 30,
  className: 'p-0.5 ml-0.5 my-1',
  color: "currentColor"

}


const item_icon_motion_props = {

  whileHover: { scale: 1.02 },
  transition: { duration: 0.1 }

}

type sidebar_props = {

  sidebar_user_icon: React.ReactNode; // to do: this will later accept a gmail icon from the user
  sidebar_user_name: string; // to do: name of the user's gmail account
  sidebar_user_email: string; // to do: user's gmail

}

export default function SidebarDiv({sidebar_user_icon, sidebar_user_name, sidebar_user_email}: sidebar_props) {

  const path_name = usePathname();
  const [is_expanded, toggle_expand] = useState(false);

  return (

    <>

      <aside className = "h-screen"> {/* give it full viewport height */}

        {/* nav bar div; make it flex so the item list can take up the rest of the space*/}
        <motion.nav animate = { { width: is_expanded ? `14.5rem` : `3.75rem` } } transition = { { duration: 0.3 } } className = {`h-full flex flex-col bg-night border-r border-r-neutral-800 shadow-sm`}> 

          {/* make the logo the button to toggle side bar */}
          <div className = "h-16 flex justify-between items-center"> 

            <button onMouseDown = {() => toggle_expand(!is_expanded)} className = "ml-1.25 cursor-pointer">

              <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.1 }} >

                <Logo logo_color = {is_expanded ? "#698f3f" : "#384f1f"} className = {`w-12 p-1.5 hover:bg-neutral-800 transition-ease duration-300 rounded-lg`}/>
              
              </motion.div>

            </button>

          </div>
        
          <ul className = "flex-1 px-3"> {/* flex-1 makes this take up the rest of the space of the div*/} {/*TODO: make a mapping config for the sidebar items for easier scalability*/}

            <motion.div {...item_icon_motion_props}> <SidebarItem button_icon={<CalendarPlus {...item_icon_props} />}  is_expanded = {is_expanded} button_route="/taillink" button_text="TailLink" /> </motion.div>
            <motion.div {...item_icon_motion_props}> <SidebarItem button_icon= {<BrainCircuit {...item_icon_props} />}  is_expanded = {is_expanded} button_route="/quizscale" button_text="QuizScale" /> </motion.div>
            
            <hr className="my-3 border-neutral-800" />
            
            <motion.div {...item_icon_motion_props}> <SidebarItem button_icon={<Settings {...item_icon_props} />} is_expanded = {is_expanded} button_route="/settings" button_text="Settings" /> </motion.div>
            <motion.div {...item_icon_motion_props}> <SidebarItem button_icon={<CircleQuestionMark {...item_icon_props} />}  is_expanded = {is_expanded} button_route="/help" button_text="Help" /> </motion.div>

          </ul>

          <div className = "border-t border-t-neutral-800 flex p-3">

            {/* div for the gmail user icon */}
            <div className="w-8 h-8 rounded-md overflow-hidden bg-neutral-800 flex items-center justify-center">
            
              {sidebar_user_icon}

            </div>

            {
            
            is_expanded ? 

            <div className = "flex justify-between items-center w-40 ml-3">

              <div className = "leading-4">

                <h4 className = "text-asparagus">{sidebar_user_name}</h4>
                <span className = "text-xs text-broccoli">{sidebar_user_email}</span>

              </div>

              <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>

                <button className='cursor-pointer'>
                
                  <MoreVertical color='#698f3f' size={20} className="hover:bg-neutral-800 rounded-lg transition ease duration-200"/>
                
                </button>

              </motion.div>

            </div>

            : 
            
            null 
            
            }

          </div>

        </motion.nav>
    
      </aside>
        
    </>

  );

}
