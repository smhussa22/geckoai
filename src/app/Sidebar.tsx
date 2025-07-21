// the sidebar that has the toolbox of components/utilities. collapsible
'use client';
import React from 'react';
import { useState } from 'react';
import Logo from './Logo';
import SidebarItem from './SidebarItem';
import { MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';

type sidebar_props = {

  sidebar_user_icon: React.ReactNode; // to do: this will later accept a gmail icon from the user
  sidebar_user_name: string; // to do: name of the user's gmail account
  sidebar_user_email: string; // to do: user's gmail
  children: React.ReactNode; 

}

export default function Sidebar({sidebar_user_icon, sidebar_user_name, sidebar_user_email, children}: sidebar_props) {

  const [is_retracted, toggle_retract] = useState(false);
  
  return (

    <>

      <aside className = "h-screen"> {/* give it full viewport height */}

        {/* nav bar div; make it flex so the item list can take up the rest of the space*/}
        <nav className = "h-full flex flex-col bg-night border-r border-r-neutral-800 shadow-sm"> 

          {/* make the logo the button to toggle side bar */}
          <div className = "h-16 flex justify-between items-center"> 

            <button onMouseDown = {() => toggle_retract(!is_retracted)} className = "p-1.5 cursor-pointer">

              <Logo logo_color = {is_retracted ? "#698f3f" : "#384f1f"} className = "w-12 p-1.5 hover:bg-neutral-800 rounded-lg transition-colors duration-300"/>
              
            </button>


          </div>

          <ul className = "flex-1 px-3"> {/* flex-1 makes this take up the rest of the space of the div*/}

            { children } {/* accept passed in children as sidebar items */}

          </ul>

          <div className = "border-t border-t-neutral-800 flex p-3">

            {/* div for the gmail user icon */}
            <div className="w-10 h-10 rounded-md overflow-hidden bg-neutral-800 flex items-center justify-center">
            
              {sidebar_user_icon}

            </div>

            {/* div for the gmail name/email text */}
            <div className = "flex justify-between items-center w-40 ml-3">

              <div className = "leading-4">

                <h4 className = "text-asparagus">{sidebar_user_name}</h4>
                <span className = "text-xs text-broccoli">{sidebar_user_email}</span>

              </div>

              {/* three dot icon taken from lucide react */}

              <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>

                <button className='cursor-pointer'>
                
                  <MoreVertical color='#698f3f' size={20} className="hover:bg-neutral-800 rounded-lg transition ease duration-200"/>
                
                </button>

              </motion.div>

            </div>


          </div>

        </nav>
    
      </aside>

    </>

  );

  
  
}
