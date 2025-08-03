'use client';
import React from 'react';
import { FaGoogle } from "react-icons/fa";
import { handleGoogleLogIn } from "lib/authFunctions";

export default function HomePage() {

  return (

    <div className="h-screen flex relative z-0">
      
      <div className='bg-night rounded-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg z-1'>
        
        <div className='justify-items-center p-7'>
          
          <h1 className='text-asparagus text-2xl font-semibold'>Welcome back!</h1>
          <h2 className='text-asparagus'>Continue with your Gmail to begin using GeckoAI!</h2>

          <button onClick={handleGoogleLogIn} className='my-3 hover:bg-night hover:text-broccoli transition-colors duration-150 bg-broccoli border border-neutral-800 cursor-pointer rounded-lg p-2 w-100 h-15 text-3xl font-bold text-night flex items-center justify-center gap-4'>
            
            <FaGoogle /> Log In With Gmail

          </button>

        </div>

      </div>

    </div>

  );
  
}
