// the sidebar that has the toolbox of components/utilities. collapsible
'use client';
import React from 'react';
import { useState } from 'react';
import Logo from './Logo';
import TaillinkIcon from './TaillinkSVG';
import Sidebutton from './Sidebutton';

export default function Sidebar() {

  const [isToggled, toggle] = useState(true);
  
  return (

    <div className="fixed h-full w-16 flex flex-col items-center gap-4 bg-night border-r border-neutral-800">

      {isToggled ? (

        <>
        
          <Logo logo_className="w-18 h-18 p-3" />
          <Sidebutton button_route = "/taillink" button_icon = {<TaillinkIcon svg_className="w-15 h-auto p-4" />}/>

        </>

      ) : (

        <>
        
          <p>test</p>

        </>

        
      )}
    

    </div>

  );
  
}
