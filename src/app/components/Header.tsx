// the header that appears on the top of each page w/ the description of the component
'use client';
import React from 'react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { routeMetadata } from '../routeMetadata';
import { Tooltip } from 'react-tooltip';

export default function Header() {

  const pathName = usePathname();
  const metadataKey = pathName.split("/").filter(Boolean)[0];
  const metadata = routeMetadata[metadataKey];

  const [logOutMenu, toggleLogOutMenu] = useState(false);


  return (

    <>

      <div className = "w-full items-center flex border-b border-b-neutral-800 px-4 py-3">

        <div className=''>

          <h1 className = "text-asparagus text-2xl font-semibold">{metadata.title}</h1>
          <p className = "text-broccoli ml-0.5">{metadata.subTitle}</p>
          
        </div>
      
        <div className='flex gap-6 ml-auto'>

          <button className = 'bg-asparagus px-5 font-semibold rounded-md cursor-pointer'> Upgrade </button>
          
          <button onClick = { () => toggleLogOutMenu(!logOutMenu) } data-tooltip-id = "gmailIcon" className = 'cursor-pointer overflow-hidden data-tooltip-target bg-neutral-800 w-12 aspect-square rounded-full'>

            <img src = "logo.svg"/>

          </button>

        </div>

        {!logOutMenu &&
        
          <Tooltip id="gmailIcon" place="bottom" opacity={1} style={{backgroundColor: '#262626', borderRadius: '0.375rem'}} noArrow delayShow={0} delayHide={0}>

          <div className= 'flex flex-col text-asparagus'>
          
            <h1 className='text-ghost'>Google Account</h1>
            <h1 className='text-asparagus'>User Name</h1>
            <h1 className='text-asparagus'>User Email</h1>
            
          </div>

          </Tooltip>

        }

      </div>

    </>

  );

}
