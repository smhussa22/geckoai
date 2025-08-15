import React from 'react';
import Link from 'next/link';

export default function () {

    return (

        <>

        <Link href="/server-status" className='drop-shadow-md absolute right-2 flex flex-row text-center items-center gap-2 bg-neutral-600 p-2 rounded-xl'>
        
            <div className={`rounded-full w-4 h-4 bg-green-700 animate-pulse`}></div>
            <span className=' text-neutral-400'>Server Status: Operational</span>
        
        </Link>

        </>

    );

}