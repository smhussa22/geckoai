import type { Metadata } from "next";
import "./globals.css";
import SidebarLayout from "./SidebarLayout";
import Header from "./Header";
import { routeMetadata } from "./routeMetadata";

export const metadata: Metadata = {

  title: "GeckoAI",
  description: "A study tool by Syed Maroof Hussain",

};

export default function RootLayout({children}: { children: React.ReactNode; }) {

  return (

    <html lang="en">

      <body className="antialiased">

        <div className="flex h-screen">

          <SidebarLayout/>
          <Header title = "TailLink" sub_title= "Your semester, built seamlessly"/>

        </div>

      </body>

    </html>

  );

}
