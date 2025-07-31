import React from 'react';

export default function PopUp() {

    return (

        <>

            <div className="h-screen flex relative z-0">

                <div className='bg-night w-125 h-90 rounded-lg absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 shadow-lg z-1'>

                    <div className='justify-items-center p-4'>

                        <h1 className='text-asparagus text-2xl font-semibold'>Account Settings</h1>
              
                    </div>

                </div>

            </div>


        </>

    );

}