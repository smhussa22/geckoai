// the sidebar that has the toolbox of components/utilities. collapsible
'use client';
import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Tooltip } from 'react-tooltip';
import { useMemo } from 'react';


type button_props = {

    buttonIcon: React.ReactNode; 
    buttonRoute: string; 
    buttonText: string; 
    isExpanded: boolean;

} 

export default function SidebarItem ({buttonIcon, buttonRoute, buttonText, isExpanded} : button_props) {

  const router = useRouter();
  const pathName = usePathname();
  const isPage = (pathName === buttonRoute); 
  const tooltipId = `tooltip-${buttonText}`;  

  return ( 

    <>
    
      {/* @todo remove unnecessary framer motion */}

      <motion.button data-tooltip-id={tooltipId} data-tooltip-content={buttonText} animate = { {color: isPage ? '#698f3f' : '#384f1f'} } transition= { { duration: 0 } } onClick = { () => { router.push(`./${buttonRoute}`) } } className = {`transition-transform duration-100 hover:scale-[1.05] data-tooltip-target overflow-hidden text-asparagus w-full flex font-semibold items-center my-2 gap-1 rounded-md cursor-pointer hover:bg-neutral-800`}> 
        
        {buttonIcon}
        {isExpanded ? <span className="opacity-0 animate-fadein transition-colors duration-300">{buttonText}</span> : null}
        
      </motion.button>

      {!isExpanded && ( 

        <Tooltip id={tooltipId} place="left" opacity={1} style={{ marginLeft: '0.5rem', backgroundColor: '#262626', padding: '0.4rem', borderRadius: '0.375rem', color: isPage ? '#698f3f' : '#384f1f', transitionProperty: 'color', transitionDuration: '300ms'}} noArrow delayShow={0} delayHide={0}/>

      )}

    </>

  );

}
