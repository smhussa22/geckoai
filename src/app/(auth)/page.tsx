'use client';
import React from 'react';
import { FaGoogle } from "react-icons/fa";
import { FaApple } from "react-icons/fa";

export default function HomePage() {


  return (
    
    <>

          <div className="h-screen flex relative z-0">

            <div className='bg-night rounded-lg absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 shadow-lg z-1'>

              <div className='justify-items-center p-7'>

                <h1 className='text-asparagus text-2xl font-semibold'>Welcome back!</h1>
                <h2 className='text-asparagus'>Continue with your gmail to begin using GeckoAI!</h2>


                  <div className=''>

                    <button className='my-3 hover:bg-night hover:text-broccoli transition-colors duration-150 bg-broccoli border border-neutral-800 cursor-pointer rounded-lg p-2 w-100 h-15 text-3xl font-bold text-night flex items-center justify-center gap-4'>
  
                        <FaGoogle />
                        Log In With Gmail

                    </button>
                    
                    <button className="my-3 hover:bg-night hover:text-neutral-800 transition-colors duration-0 bg-broccoli border border-neutral-800 cursor-pointer rounded-lg p-2 w-100 h-15 text-3xl font-bold text-night flex items-center justify-center gap-4 group">
  
                        <FaApple />
                        <span className="group-hover:hidden">Log In With Apple</span>
                        <span className="hidden group-hover:inline">Feature Unavailable</span>
                    
                    </button>

                </div>
              
              </div>

            </div>

          </div>

    </>

  );

}
