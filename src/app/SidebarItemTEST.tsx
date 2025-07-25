// the sidebar that has the toolbox of components/utilities. collapsible
'use client';
import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Tooltip } from 'react-tooltip';
import { useMemo } from 'react';


type button_props = {

    button_icon: React.ReactNode; // the icon of the button
    button_route: string; // the page the button navigates to
    button_text: string; // the text/description of the button item
    is_expanded: boolean;

} 

const SidebarItem = ({button_icon, button_route, button_text, is_expanded} : button_props) => {

  const router = useRouter();
  const path_name = usePathname();
  const is_page = (path_name === button_route); // if the route associated with the button is also the current page, it is that button's page
  const tooltip_id = `tooltip-${button_text}`;  

  return ( 

    <>
    
      <motion.button data-tooltip-id={tooltip_id} data-tooltip-content={button_text} animate = { {color: is_page ? '#698f3f' : '#384f1f'} } transition= { { duration: 0 } } onClick = { () => { router.push(`./${button_route}`) } } className = "data-tooltip-target overflow-hidden text-asparagus w-full transition-colors flex font-semibold items-center my-2 gap-1 rounded-md cursor-pointer hover:bg-neutral-800"> 
        
        {button_icon}
        {is_expanded ? <motion.span initial = { { opacity: 0 } } animate = {{ opacity: 1 }} transition = { { duration: 0.4 } } className="">{button_text}</motion.span> : null}
        
      </motion.button>

      {/* @todo: make your own tooltip later*/}

      {!is_expanded && ( 

        <Tooltip id={tooltip_id} place="left" opacity={1} style={{ marginLeft: '0.5rem', backgroundColor: '#262626', padding: '0.4rem', borderRadius: '0.375rem', color: is_page ? '#698f3f' : '#384f1f', transitionProperty: 'color', transitionDuration: '300ms'}} noArrow delayShow={0} delayHide={0}/>

      )}

    </>

  );

}

export default React.memo(SidebarItem);