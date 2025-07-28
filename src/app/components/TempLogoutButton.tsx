// the sidebar that has the toolbox of components/utilities. collapsible
'use client';
import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Tooltip } from 'react-tooltip';
import { useMemo } from 'react';


type button_props = {

    button_icon: React.ReactNode; // the icon of the button
    button_text: string; // the text/description of the button item
    is_expanded: boolean;

} 

export default function TempLogoutButton ({button_icon, button_text, is_expanded} : button_props) {

  const router = useRouter();
  const path_name = usePathname();
  const tooltip_id = `tooltip-${button_text}`;  

  return ( 

    <>
    
      <button data-tooltip-id={tooltip_id} data-tooltip-content={button_text} className = {`transition-transform duration-100 hover:scale-[1.05] data-tooltip-target overflow-hidden text-cyan-500 w-full flex font-semibold items-center my-2 gap-1 rounded-md cursor-pointer hover:bg-neutral-800`}> 
        
        {button_icon}
        {is_expanded ? <span className="opacity-0 animate-fadein transition-colors duration-300">{button_text}</span> : null}
        
      </button>

      {/* @todo: make your own tooltip later*/}

      {!is_expanded && ( 

        <Tooltip id={tooltip_id} place="left" opacity={1} style={{ marginLeft: '0.5rem', backgroundColor: '#262626', padding: '0.4rem', borderRadius: '0.375rem', transitionProperty: 'color', transitionDuration: '300ms'}} noArrow delayShow={0} delayHide={0}/>

      )}

    </>

  );

}
