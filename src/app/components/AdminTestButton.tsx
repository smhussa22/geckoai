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


    }

    return (

        <>

            <button onClick = {handleClick} className={`${bounce && 'animate-bounce'} bg-sky-300 hover:bg-sky-400 transition-colors duration-200 px-5 font-semibold rounded-md shadow-md cursor-pointer`}>

                Test Button

            </button>

        </>

    );

}