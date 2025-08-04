// the header that appears on the top of each page w/ the description of the component
'use client';
import React from 'react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { routeMetadata } from '../routeMetadata';
import { Tooltip } from 'react-tooltip';
import { useUser } from '../contexts/UserContext';
import AccountDropDown from './AccountDropdown';

// @todo: add text and subtext animation. use indexing to play a downroll animation if user clicked from an above element and vice versa
export default function Header() {

  const pathName = usePathname();
  const metadataKey = pathName.split("/").filter(Boolean)[0];
  const metadata = routeMetadata[metadataKey];

  const [logOutMenu, toggleLogOutMenu] = useState(false);
  const {user, GoogleLogIn, GoogleLogOut } = useUser();

  return (

    <>

      <div className = "w-full items-center flex border-b border-b-neutral-800 px-4 py-3">

        <div className=''>

          <h1 className = "text-asparagus text-2xl font-semibold">{metadata.title}</h1>
          <p className = "text-broccoli ml-0.5">{metadata.subTitle}</p>
          
        </div>
      
        <div className='flex gap-6 ml-auto'>

          <button className = 'bg-asparagus px-5 font-semibold rounded-md cursor-pointer'> Upgrade </button>
          
          <button onClick = { () => { toggleLogOutMenu(!logOutMenu); } } data-tooltip-id = "gmailIcon" className = 'cursor-pointer overflow-hidden data-tooltip-target bg-neutral-800 w-12 aspect-square rounded-full'>

            <img src = {`${user?.picture}`}/>

          </button>

        </div>

        <AccountDropDown/>

      </div>

    </>

  );

}
