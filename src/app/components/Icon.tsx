"use client";
import React from "react";

interface IconProps {

  icon: React.ReactNode;

}

const Icon = React.memo(

  function SidebarIcon({ icon }: IconProps) {
    
    return <div className="inline-flex">{icon}</div>;

  },

  () => true

);

export default Icon;