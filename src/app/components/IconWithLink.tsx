import Link from "next/link";
import React from 'react';

export default function IconWithLink({icon, text, color, hover, href}: {icon: React.ReactNode, text: string, color: string, hover: string, href: string}) {

    return (

        <Link href={href} className={`text-${color} hover:text-${hover} flex gap-2 font-semibold transition-colors duration-200`}>

            {icon}
            {text}

        </Link>

    );

}