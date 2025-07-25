import React from "react";
import SidebarDiv from './SidebarDiv'

const gmail_user_icon = () => {

    return (
    
        <img src = "/logo.svg"/>

    );

};

export default function Sidebar(){

    return( <> <SidebarDiv sidebar_user_name="GeckoAI User" sidebar_user_email="geckoai@geckoai.com"/></> );

}