import type { Metadata } from "next";
import '../globals.css';

export const metadata: Metadata = {

  title: "GeckoAI",
  description: "A study tool by Syed Maroof Hussain",

};

export default function AuthLayout({children}: { children: React.ReactNode; }) {

  return (

      
      <div className="auth-layout flex items-center justify-center h-screen bg-night">
      {children}
      
    </div>

  );

}
