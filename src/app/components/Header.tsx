'use client';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { routeMetadata } from '../routeMetadata';
import { Tooltip } from 'react-tooltip';
import { useUser } from '../contexts/UserContext';
import AccountDropDown from './AccountDropdown';


import AdminTestButton from './AdminTestButton';

export default function Header() {

  const pathName = usePathname();
  const metadataKey = pathName.split('/').filter(Boolean)[0];
  const metadata = routeMetadata[metadataKey];

  const [logOutMenu, setLogOutMenu] = useState(false);
  const { user } = useUser();

  return (

    <>
      
      <div className="relative w-full items-center flex border-b shadow-md z-10 border-b-neutral-800 px-4 py-3">

        <div>

          <h1 className="text-asparagus text-2xl font-semibold">{metadata.title}</h1>
          <p className="text-broccoli ml-0.5">{metadata.subTitle}</p>

        </div>

        <div className="flex gap-6 ml-auto">

          <AdminTestButton/>

          <button className="bg-asparagus px-5 font-semibold rounded-md shadow-md cursor-pointer">

            Upgrade

          </button>

          <button onClick={() => setLogOutMenu(!logOutMenu)} data-tooltip-id="gmailIcon" className="cursor-pointer overflow-hidden bg-neutral-800 w-12 aspect-square rounded-full" type="button">
          
            <img src={user?.picture} alt="Profile" />
          
          </button>
        
        </div>

        <AccountDropDown open={logOutMenu} />

        {!logOutMenu && (

          <Tooltip id="gmailIcon" place="bottom" opacity={1} style={{ backgroundColor: '#262626', borderRadius: '0.375rem' }} noArrow delayShow={0} delayHide={0}>
            
            <div className="flex flex-col text-asparagus">
            
              <h1 className="text-ghost">Google Account</h1>
              <h1 className="text-asparagus">{user?.name}</h1>
              <h1 className="text-asparagus">{user?.email}</h1>
            
            </div>
          
          </Tooltip>
        
        )}
      
      </div>
    
    </>
  
  );

}
