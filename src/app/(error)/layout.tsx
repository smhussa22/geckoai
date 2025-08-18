import React from 'react';
import '../globals.css';

export default function AuthLayout({children}: { children: React.ReactNode; }) {

  return (

      
    <div className="auth-layout flex flex-row r h-screen bg-night">
    
      {children}
      
    </div>

  );

}
