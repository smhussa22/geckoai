"use client";
import React from "react";

interface SidebarIconProps {

  icon: React.ReactNode;

}

const SidebarIcon = React.memo(

  function SidebarIcon({ icon }: SidebarIconProps) {
    
    return <div className="inline-flex">{icon}</div>;

  },

  () => true

);

export default SidebarIcon;