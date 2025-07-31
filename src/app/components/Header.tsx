// the header that appears on the top of each page w/ the description of the component
'use client';
import React from 'react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { routeMetadata } from '../routeMetadata';
import { Tooltip } from 'react-tooltip';
import { useUser } from '@/lib/firebase_auth';

export default function Header() {

  const path_name = usePathname();
  const metadata_key = path_name.split("/").filter(Boolean)[0];
const metadata = routeMetadata[metadata_key] || { title: "GeckoAI", sub_title: "" };

  const [log_out_menu, toggle_log_out_menu] = useState(false);

  const user = useUser();

  return (

    <>

      <div className = "w-full items-center flex border-b border-b-neutral-800 px-4 py-3">

        <div className=''>

          <h1 className = "text-asparagus text-2xl font-semibold">{metadata.title}</h1>
          <p className = "text-broccoli ml-0.5">{metadata.sub_title}</p>
          
        </div>
      
        <div className='flex gap-6 ml-auto'>

          <button className = 'bg-asparagus px-5 font-semibold rounded-md cursor-pointer'> Upgrade </button>
          
          <button onClick = { () => toggle_log_out_menu(!log_out_menu) } data-tooltip-id = "gmail_icon" className = 'cursor-pointer overflow-hidden data-tooltip-target bg-neutral-800 w-12 aspect-square rounded-full'>

            <img src = {`${user?.photoURL}`}/>

          </button>

        </div>

        {!log_out_menu &&
        
          <Tooltip id="gmail_icon" place="bottom" opacity={1} style={{backgroundColor: '#262626', borderRadius: '0.375rem'}} noArrow delayShow={0} delayHide={0}>

          <div className= 'flex flex-col text-asparagus'>
          
            <h1 className='text-ghost'>Google Account</h1>
            <h1 className='text-asparagus'>{user?.displayName}</h1>
            <h1 className='text-asparagus'>{user?.email}</h1>
            
          </div>

          </Tooltip>

        }

      </div>

    </>

  );

}
