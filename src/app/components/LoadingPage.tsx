"use client";
import React from "react";
import Logo from "./Logo";
import IconWithLink from "./IconWithLink";
import { GrSatellite } from "react-icons/gr";
import { FiMessageCircle } from "react-icons/fi";
import RandomFact from './RandomFact';

// @todo make loading actually show for at least 2 seconds
// @todo make an actual loading animation
// @todo make an actual serverstatus page
// @todo make an actual contact page
// @todo fix the facts remounting 

export default function Loading() {

  return (

    <>
    
      <div className="h-screen w-screen flex flex-col items-center gap-2 justify-center relative ">
      
          <img src = "/logoAnimated.svg" alt = "GeckoAI Logo" draggable={false} className="mb-2 w-30 h-30 animate-bounce"/>
          
          <div className="rounded-md border-2 mb-2 shadow-md border-neutral-800 p-2">

            <h1 className="text-broccoli font-bold">Did You Know</h1>

          </div>

          <RandomFact/>

          <h3 className="text-neutral-700 font-bold">Trouble connecting? Let us know!</h3>
          
          <div className="flex gap-6">

            <IconWithLink href = "/server-status" icon = {<GrSatellite size={25}/>} text="Server Status" color="asparagus" hover="broccoli"/>
            <IconWithLink href = "/contact" icon = {<FiMessageCircle size={25}/>} text="Contact Us" color="asparagus" hover="broccoli"/>

          </div>
          
      </div>
      
    </>

  );
}
