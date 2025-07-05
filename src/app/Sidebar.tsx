// the sidebar that has the toolbox of components/utilities
'use client';
import React from 'react';
import { useState } from 'react';


export default function Sidebar() {

  const [isToggled, toggle] = useState(false);

  return (

    <>

      <div className = "fixed h-full w-auto items-center bg-night flex flex-col gap-8 border-r border-r-neutral-800 position-fixed">
      
        <div className="w-16 h-auto m-6"> 

          <img src="/logo.svg"/> 

        </div>

        <div>

          

        </div>

      </div>
        

    </>

  );

}
