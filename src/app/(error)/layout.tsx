// app/(auth)/layout.tsx (AuthLayout)
import React from "react";
import "../globals.css";

export default function AuthLayout({children}: { children: React.ReactNode; }) {

  return (

    <div className="auth-layout flex flex-row r min-h-screen">

      {children}

    </div>

  );

}
