'use client';
import React from 'react';
import { FaGoogle } from "react-icons/fa";
import { LuInfo } from "react-icons/lu";
import { useUser } from '../contexts/UserContext';
import { Tooltip } from 'react-tooltip';

export default function HomePage() {

  const {GoogleLogIn} = useUser(); 
  
  return (

    <div className="h-screen flex relative z-0">
      
      <div className=' bg-night rounded-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-md z-1'>
        
        <div className='justify-items-center p-7'>
          
          <h1 className='text-asparagus text-2xl font-semibold'>Welcome back!</h1>
          <h2 className='text-asparagus'>Continue with your Gmail to begin using GeckoAI!</h2>

          <button onClick={GoogleLogIn} className='my-3 hover:bg-night hover:text-broccoli transition-colors duration-150 bg-broccoli border border-neutral-800 cursor-pointer rounded-lg p-2 w-100 h-15 text-3xl font-bold text-night flex items-center justify-center gap-4'>
            
            <FaGoogle /> Continue With Google

          </button>

          <div className="flex flex-row gap-2 items-center transition-colors duration-300 group">
    
            <LuInfo size={30} data-tooltip-id="info" className="text-broccoli group-hover:text-asparagus transition-colors duration-300"/>

          </div>


            <Tooltip id="info" place="right" opacity={1} style={{ marginLeft: '0.5rem', backgroundColor: '#262626', padding: '0.4rem', color: '#698f3f', borderRadius: '0.375rem', transitionProperty: 'color', transitionDuration: '300ms'}} noArrow delayShow={0} delayHide={0}>

              GeckoAI v1.0 is only compatible with Google accounts.

            </Tooltip>

        </div>

      </div>

    </div>

  );
  
}
