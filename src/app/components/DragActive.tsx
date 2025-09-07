import React from 'react';
import { SlSocialDropbox } from "react-icons/sl";
export default function DragActive() {

    return (

        <>

            <div className='flex items-center justify-center rounded-md absolute bg-asparagus/30 -translate-y-1/75 -translate-x-1/140 w-435 h-239 z-100 pointer-events-none'>

                <div className='relative tracking-tighter flex flex-col items-center justify-center font-bold text-night'>

                    <SlSocialDropbox className = "absolute bottom-20" size = {80}/>
                    <h1 className='text-2xl'>Drag Files!</h1>
                    <h2>Note: PDFs, documents, text files, images, and presentations are accepted.</h2>
                
                </div> 

            </div>

        </>

    );

}