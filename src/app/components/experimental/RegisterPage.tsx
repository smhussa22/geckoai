'use client';
import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; 
import {Eye, EyeOff} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// @todo: make the background move with actual forests and animals lizard blink gecko blink ladybug jungle leaves ~ minagi

export default function register_page() {

  const[show_password, set_show_password] = useState(false);
  
  return (
    
    <>

          <div className="h-screen flex relative z-0">

            <div className='bg-night w-125 h-119 rounded-lg absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 shadow-lg z-1'>

              <div className='justify-items-center p-4'>

                <h1 className='text-asparagus text-2xl font-semibold'>Welcome back!</h1>
                <h2 className='text-asparagus'>Log in to begin using GeckoAI!</h2>

                <div>

                  <h3 className='text-asparagus font-bold py-1'>Gmail:</h3>

                  <div className='flex justify-center'>
  
                    <input type="email" className='focus:outline-none focus:ring-1 focus:ring-asparagus text-asparagus pl-2 h-10 bg-neutral-800 border-neutral-700 border rounded-lg w-1/1'/>

                  </div>

                  <h3 className='text-asparagus font-bold py-1'>First Name:</h3>

                  <div className='flex justify-center'>
  
                    <input type="text" className='focus:outline-none focus:ring-1 focus:ring-asparagus text-asparagus pl-2 h-10 bg-neutral-800 border-neutral-700 border rounded-lg w-1/1'/>

                  </div>

                  <h3 className='text-asparagus font-bold py-1'>Last Name:</h3>

                  <div className='flex justify-center'>
  
                    <input type="text" className='focus:outline-none focus:ring-1 focus:ring-asparagus text-asparagus pl-2 h-10 bg-neutral-800 border-neutral-700 border rounded-lg w-1/1'/>

                  </div>

                  <h3 className='text-asparagus font-bold py-1'>Password:</h3>

                  <div className='relative flex justify-center'>
  
                    <input type={show_password ? 'text' : 'password'} className='focus:outline-none focus:ring-1 focus:ring-asparagus text-asparagus pl-2 h-10 bg-neutral-800 border-neutral-700 border rounded-lg w-1/1'/>
                   
                    <AnimatePresence mode="wait" initial={false}>

                      <motion.button key={show_password ? 'eye-off' : 'eye'} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.2 }} type = "button" onClick = { () => set_show_password(!show_password) } className="absolute right-3 top-1/2 -translate-y-1/2 text-asparagus" >

                        {show_password ? <EyeOff color = {'#525252'} size={20} /> : <Eye color = {'#525252'} size={20} />}

                      </motion.button>

                    </AnimatePresence>

                  </div>

                  <div className='mt-2'>

                    <button className='hover:bg-night hover:text-broccoli transition-colors duration-150 bg-broccoli border border-neutral-800 cursor-pointer rounded-lg p-2 w-100 h-15 text-3xl font-bold text-night'>Create Account</button>

                  </div>

                  <div className='mt-1'>

                    <Link href = "/" className="font-semibold text-sm text-asparagus hover:underline">Already have an account? Log in!</Link>
                  
                  </div>

                </div>
              
              </div>

            </div>

          </div>

    </>

  );

}
