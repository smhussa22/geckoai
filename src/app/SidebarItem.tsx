// the sidebar that has the toolbox of components/utilities. collapsible
'use client';
import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

type button_props = {

    button_icon: React.ReactNode; // the icon of the button
    button_route: string; // the page the button navigates to
    button_text: string; // the text/description of the button item

} 

export default function SidebarItem({button_icon, button_route, button_text} : button_props) {

  const router = useRouter();
  const path_name = usePathname();

  const is_page = (path_name == button_route); // if the route associated with the button is also the current page, it is that button's page

  return ( 

    <>
      
      <motion.button animate = { {color: is_page ? `#698f3f` : `#384f1f`} } transition= { { duration: 0.01 } } onClick = { () => { router.push(`./${button_route}`) } } className = {`w-full transition-colors flex font-semibold items-center my-2 gap-1 rounded-md cursor-pointer hover:bg-neutral-800`}> 
        
        {button_icon}
        <span className="my-2">{button_text}</span>
        
      </motion.button>
    
    </>

  );

}