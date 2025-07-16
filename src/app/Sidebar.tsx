// the sidebar that has the toolbox of components/utilities. collapsible
'use client';
import React from 'react';
import { useState } from 'react';
import Logo from './Logo';
import TaillinkIcon from './TaillinkSVG';
import Sidebutton from './Sidebutton';

type sidebar_props = {

  children: string;

}

export default function Sidebar({children}: sidebar_props) {
  
  return (

    <>

      <aside className = "h-screen">

        <nav className = "h-full flex flex-col bg-night border-r border-r-neutral-800 shadow-sm">

          <div className = "pb-2 h-16 flex justify-between items-center gap-1"> 

            <button className = "p-1.5">

              <Logo className = "w-12 p-1.5 hover:bg-neutral-600 rounded-lg"/>
              
            </button>

          </div>

          <ul className = "flex-1"> 

            { children }
            
          </ul>

          <div className = "border-t border-t-neutral-800 flex p-3">




          </div>

        </nav>
    
      </aside>

    </>

  );

  
  
}
