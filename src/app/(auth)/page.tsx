'use client';
import React from 'react';
import { FaGoogle } from "react-icons/fa";
import { useUser } from '../contexts/UserContext';

export default function HomePage() {

  const {GoogleLogIn} = useUser(); 
  
  return (

    <div className="h-screen flex relative z-0">
      
      <div className='outline-neutral-800 outline  bg-night rounded-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-md z-1'>
        
        <div className='justify-items-center p-7'>
          
          <h1 className='text-asparagus text-2xl font-semibold'>Welcome back!</h1>
          <h2 className='text-asparagus'>Continue with your Gmail to begin using GeckoAI!</h2>

          <button onClick={GoogleLogIn} className='my-3 hover:bg-night hover:text-broccoli transition-colors duration-150 bg-broccoli border border-neutral-800 cursor-pointer rounded-lg w-100 h-15 text-3xl font-bold text-night flex items-center justify-center gap-4'>
            
            <FaGoogle /> Continue With Google

          </button>

          <h1 className='text-broccoli text-sm hover:text-asparagus transition-colors duration-200 cursor-default'>GeckoAI is currently only compatible with Google accounts.</h1>

        </div>


      </div>

    </div>

  );
  
}
