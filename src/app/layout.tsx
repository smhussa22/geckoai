import type { Metadata } from "next";
import "./globals.css";
import Sidebar from './Sidebar';
import Header from "./Header";
import { routeMetadata } from "./routeMetadata";
import 'react-tooltip/dist/react-tooltip.css';

export const metadata: Metadata = {

  title: "GeckoAI",
  description: "A study tool by Syed Maroof Hussain",

};

export default function RootLayout({children}: { children: React.ReactNode; }) {

  return (

    <html lang="en">

      <body className="antialiased">

        <div className="flex h-screen">

          <Sidebar/>

          <div className = "flex flex-col flex-1">

            <Header title = "TailLink" sub_title= "Your semester, built seamlessly"/>

            <main className="flex-1 overflow-y-auto">

              { children }

            </main>

          </div>

        </div>

      </body>

    </html>

  );

}
