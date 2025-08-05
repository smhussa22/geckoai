import React from 'react';
import Icon from './Icon';

type ButtonProps = {

    name: string;
    description: string;

}

export default function DashboardButton({name, description}: ButtonProps) {

    return (

        <>

            <button>

                <h1>{name}</h1>
                <h2>{description}</h2>
                
            </button>


        </>

    );

}