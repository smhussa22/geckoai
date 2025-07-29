'use client';
import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaGoogle } from "react-icons/fa";
import { FaApple } from "react-icons/fa";
import { sign_up_with_google } from '@/lib/firebase_auth';

// @todo: make the background move with actual forests and animals lizard blink gecko blink ladybug jungle leaves ~ minagi

export default function HomePage() {

  const [show_password, set_show_password] = useState(false);
  const [error_object, set_error_object] = useState< string[] | null >(null);
  const router = useRouter();

  const google_login = async () => {

    try{

        const {user, token} = await sign_up_with_google();
        set_error_object(null);
        router.push('/taillink');

    }catch(error: any){

        console.error("Google Login Failed: ", error);
        set_error_object(error.list);
        
    }

  }

  return (
    
    <>

          <div className="h-screen flex relative z-0">

            <div className='bg-night rounded-lg absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 shadow-lg z-1'>

              <div className='justify-items-center p-7'>

                <h1 className='text-asparagus text-2xl font-semibold'>Welcome back!</h1>
                <h2 className='text-asparagus'>Continue with your gmail to begin using GeckoAI!</h2>


                  <div className=''>

                    <button onClick = { google_login } className='my-3 hover:bg-night hover:text-broccoli transition-colors duration-150 bg-broccoli border border-neutral-800 cursor-pointer rounded-lg p-2 w-100 h-15 text-3xl font-bold text-night flex items-center justify-center gap-4'>
  
                        <FaGoogle />
                        Log In With Gmail

                    </button>
                    
                    <button className="my-3 hover:bg-night hover:text-neutral-800 transition-colors duration-0 bg-broccoli border border-neutral-800 cursor-pointer rounded-lg p-2 w-100 h-15 text-3xl font-bold text-night flex items-center justify-center gap-4 group">
  
                        <FaApple />
                        <span className="group-hover:hidden">Log In With Apple</span>
                        <span className="hidden group-hover:inline">Feature Unavailable</span>
                    
                    </button>

                    <div>

                        { error_object && <h1 className='text-red-700 font-semibold text-sm'>{error_object}</h1> }  

                    </div>
                </div>
              
              </div>

            </div>

          </div>

    </>

  );

}
