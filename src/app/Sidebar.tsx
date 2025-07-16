// the sidebar that has the toolbox of components/utilities. collapsible
'use client';
import React from 'react';
import { useState } from 'react';
import Logo from './Logo';
import TaillinkIcon from './TaillinkSVG';
import Sidebutton from './Sidebutton';

type sidebar_props = {

  sidebar_items: React.ReactNode;
  sidebar_user_icon: React.ReactNode; // for now: this will later accept a gmail icon from the user
  sidebar_user_name: string;
  sidebar_user_email: string;

}

export default function Sidebar({sidebar_items, sidebar_user_icon, sidebar_user_name, sidebar_user_email}: sidebar_props) {
  
  return (

    <>

      <aside className = "h-screen">

        <nav className = "h-full flex flex-col bg-night border-r border-r-neutral-800 shadow-sm">

          <div className = "pb-2 h-16 flex justify-between items-center gap-1"> 

            <button className = "p-1.5">

              <Logo className = "w-12 p-1.5 hover:bg-neutral-600 rounded-lg"/>
              
            </button>

          </div>

          <ul className = "flex-1 px-3"> 

            { sidebar_items }
            
          </ul>

          <div className = "border-t border-t-neutral-800 flex p-3">

            <div className="w-10 h-10 rounded-md overflow-hidden bg-neutral-700 flex items-center justify-center">
            
              {sidebar_user_icon}

            </div>

            <div className = "flex justify-between items-center w-40 ml-3">

              <div className = "leading-4">

                <h4 className = "font-semibold text-asparagus">{sidebar_user_name}</h4>
                <span className = "text-xs font-semibold text-lime-900">{sidebar_user_email}</span>

              </div>

            </div>


          </div>

        </nav>
    
      </aside>

    </>

  );

  
  
}
