// the header that appears on the top of each page w/ the description of the component
import React from 'react';

type descriptions = {

  title: string;
  sub_title: string;

}

export default function Header({title, sub_title}: descriptions) {

  return (

    <>

    
      <div className = "fixed w-full h-auto items-center bg-night flex flex-row gap-8 border-b-3 border-asparagus">
      
        <div className="w-24 h-auto m-6"> 

          <img src="/logo.svg"/> 

        </div>

        <div>

          <h1 className = "text-asparagus text-4xl font-main font-bold pb-1">{`${title}`}</h1>
          <p className = "text-broccoli text-2xl font-main pl-1">{`${sub_title}`}</p>

        </div>

        
      </div>

    </>

  );

}
