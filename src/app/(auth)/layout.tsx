import type { Metadata } from "next";
import '../globals.css';

export const metadata: Metadata = {

  title: "GeckoAI",
  description: "A study tool by Syed Maroof Hussain",

};

export default function RootLayout({children}: { children: React.ReactNode; }) {

  return (

     <html lang="en">

      <body className="backdrop-blur bg-cover bg-center" style={{ backgroundImage: 'url("/login_background.png")', }}>{children}</body>
      
    </html>

  );

}
