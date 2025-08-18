import React from "react";
import Logo from "./Logo";
import Link from "next/link";
export default function NavBar() {
    
    return (

        <>
    
            <nav className="w-full flex items-center h-fit border-b border-b-neutral-800 p-4 relative">

               <Link href="/" className="flex items-center gap-2 cursor-pointer text-asparagus hover:text-broccoli">
               
                    <Logo logoColor="#698f3f" className="w-17 h-17"/>
                    <h1 className="tracking-tighter text-5xl font-extrabold">GeckoAI</h1>
               
               </Link>

               <Link className = "absolute right-0 text-2xl text-night border transition-colors hover:bg-night hover:text-broccoli border-neutral-800 rounded-md py-1.5 px-1 font-bold tracking-tighter bg-broccoli" href="/">
               
                    Log In

               </Link>



            </nav>
    
        </>

    );

};
