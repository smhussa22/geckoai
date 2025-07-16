// the sidebar that has the toolbox of components/utilities. collapsible
'use client';
import React, {ReactNode}from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type button_props = {

    button_icon: ReactNode;
    button_route: string;

}

export default function Sidebutton({button_icon, button_route} : button_props) {

  const [isToggled, toggle] = useState(false);
  const router = useRouter();

  return ( 

    <>

        <button className = ""
        
          onClick={ 
          
            () => { 
              
              router.push(button_route);
            
            } 
        
          }
        
        >

          {button_icon}

        </button>
    
    </>

  );

}