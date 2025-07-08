// the sidebar that has the toolbox of components/utilities
'use client';
import React from 'react';
import { useState } from 'react';
import Logo from './Logo';


export default function Sidebar() {

  const [isToggled, toggle] = useState(false);

  return (

    <>

      <div className = "fixed h-full w-auto items-center bg-night flex flex-col gap-8 border-r border-r-neutral-800 position-fixed">
        
      <Logo className = " p-4 w-24 h-auto"/>

      </div>
        
    </>

  );

}
