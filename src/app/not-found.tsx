import React from 'react';
import Link from 'next/link'; 
import './globals.css'

export default function Custom404() {
              
    return (
                
        <>
            
            <div className="h-screen flex relative">
            
                <div className='bg-night rounded-lg absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 shadow-lg z-1'>
            
                    <div className='flex flex-col p-4'>

                        <div className='justify-items-center'>

                            <h1 className='text-asparagus text-2xl font-semibold'>Error: 404</h1>
                            <h2 className='text-asparagus'>This page could not be found</h2>

                        </div>

                        <Link className='flex items-center justify-center my-2 hover:bg-night hover:text-broccoli transition-colors duration-150 bg-broccoli border border-neutral-800 cursor-pointer rounded-lg p-2 w-100 h-15 text-3xl font-bold text-night' href = "/">Return To Login</Link>
                        <Link className='flex items-center justify-center hover:bg-night hover:text-broccoli transition-colors duration-150 bg-broccoli border border-neutral-800 cursor-pointer rounded-lg p-2 w-100 h-15 text-3xl font-bold text-night' href = "/taillink">Return To Dashboard</Link>
                    
                    </div>
        
                </div>
            
            </div>
            
        </>
            
    );

}