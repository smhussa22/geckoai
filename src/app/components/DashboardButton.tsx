"use client";
import React from 'react';
import Icon from './Icon';

type ButtonProps = {

    name: string;
    description: string;
    icon: React.ReactNode;

}

export default function DashboardButton({name, description, icon}: ButtonProps) {

    return (

        <>

            <button className='bg-ghost p-2 rounded-md border-'>

                <Icon icon={icon} />
                <h1 >{name}</h1>
                <h2>{description}</h2>
                
            </button>


        </>

    );

}