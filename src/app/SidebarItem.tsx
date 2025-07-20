// the sidebar that has the toolbox of components/utilities. collapsible
'use client';
import React, {ReactNode}from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type button_props = {

    button_icon: ReactNode; // the icon of the button
    button_route: string; // the page the button navigates to
    button_text: string; // the text/description of the button item
    button_text_color: string; 

} 

export default function SidebarItem({button_text_color, button_icon, button_route, button_text} : button_props) {

  return ( 

    <>
      
      <li className = {`relative flex font-semibold items-center my-2 gap-1 rounded-md cursor-pointer transition-colors hover:bg-neutral-800`}> 
        
        {button_icon}
        <span className={`text-${button_text_color} my-2`}>{button_text}</span>

      </li>

    
    </>

  );

}