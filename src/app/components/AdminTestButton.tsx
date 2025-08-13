"use client";
import React from 'react';
import { useState } from 'react';
export default function AdminTestButton() {

    const [bounce, setBounce] = useState(false);

    const handleBounce = () =>{

        setBounce(true);
        setTimeout(() => setBounce(false), 500);

    }

    const handleClick = async () => {

        handleBounce();

        // test conditions here..

        try {
      const res = await fetch("/api/calendars", { cache: "no-store" });

      // Check if we actually got JSON
      const ct = res.headers.get("content-type") || "";
      if (!res.ok) {
        const text = await res.text();
        console.error("Fetch failed:", res.status, text);
        return;
      }
      if (!ct.includes("application/json")) {
        const text = await res.text();
        console.warn("Non-JSON response:", text);
        return;
      }

      const data = await res.json();
      console.log("Calendars API response:", data);
    } catch (err) {
      console.error("Error calling calendars API:", err);
    }


    }

    return (

        <>

            <button onClick = {handleClick} className={`${bounce && 'animate-bounce'} bg-sky-300 hover:bg-sky-400 transition-colors duration-200 px-5 font-semibold rounded-md shadow-md cursor-pointer`}>

                Test Button

            </button>

        </>

    );

}