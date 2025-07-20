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

    
      <div className = "w-full h-20 items-center flex border-b border-b-neutral-800">
      

        <div className = "p-3">

          <h1 className = "text-asparagus text-3xl font-main font-bold">{`${title}`}</h1>
          <p className = "text-broccoli text-lg font-main">{`${sub_title}`}</p>
          
        </div>

      </div>

    </>

  );

}
