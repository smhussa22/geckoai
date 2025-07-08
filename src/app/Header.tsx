// the header that appears on the top of each page w/ the description of the component
'use client';
import React from 'react';
import { useState } from 'react';


// todo: need to import the logo as a component later to animate it 
// import geckoLogo from '/logo.svg'; 

type header_descriptions = {

  title: string;
  sub_title: string;

}

export default function Header({title, sub_title}: header_descriptions) {

  const [isToggled, toggle] = useState(false);

  return (

    <>

    
      <div className = "fixed w-full h-auto items-center bg-night flex flex-row gap-8 border-b border-b-neutral-800 position-fixed">
      

        <div className = "">

          <h1 className = "text-asparagus text-4xl font-main font-bold pb-1">{`${title}`}</h1>
          <p className = "text-broccoli text-2xl font-main pl-1">{`${sub_title}`}</p>
          
        </div>

      </div>

    </>

  );

}
