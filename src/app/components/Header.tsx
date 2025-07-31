// the header that appears on the top of each page w/ the description of the component
'use client';
import React from 'react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { routeMetadata } from '../routeMetadata';
import { Tooltip } from 'react-tooltip';
export default function Header() {

  const [isToggled, toggle] = useState(false);
  const path_name = usePathname();

  const metadata_key = path_name.split("/").filter(Boolean)[0];

  const metadata = routeMetadata[metadata_key];

  return (

    <>

      <div className = "w-full items-center flex border-b border-b-neutral-800 px-4 py-3">

        <div>

          <h1 className = "text-asparagus text-2xl font-semibold">{metadata.title}</h1>
          <p className = "text-broccoli ml-0.5">{metadata.sub_title}</p>
          
        </div>

        <button data-tooltip-id = "gmail_icon" data-tooltip-content = "test" className = 'data-tooltip-target bg-neutral-800 w-12 aspect-square rounded-full ml-auto'>

        </button>

        <Tooltip id="gmail_icon" place="bottom" opacity={1} style={{ marginLeft: '0.5rem', backgroundColor: '#262626', padding: '0.4rem', borderRadius: '0.375rem', transitionProperty: 'color', transitionDuration: '300ms'}} noArrow delayShow={0} delayHide={0}/>

      </div>

    </>

  );

}
