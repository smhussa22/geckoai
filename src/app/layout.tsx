import type { Metadata } from "next";
import "./globals.css";

import Header from './Header';
import Sidebar from './Sidebar';
import Logo from './Logo';
import SidebarItem from './SidebarItem';

import { CalendarPlus, BookOpenCheck, Settings, HelpingHand } from 'lucide-react';

export const metadata: Metadata = {
  title: "GeckoAI",
  description: "A tool by Syed Maroof Hussain",
};

export default function RootLayout({children}: { children: React.ReactNode; }) {

  return (

    <html lang="en">

      <body className="antialiased">

        <div className="flex h-screen">

          <Sidebar sidebar_user_icon="" sidebar_user_name="GeckoAI User" sidebar_user_email="geckoai@geckoai.com">

            <SidebarItem button_text_color="" button_icon={<CalendarPlus color="" size={35} className="p-1 my-2" />} button_route="/taillink" button_text="TailLink" />
            <SidebarItem button_text_color="" button_icon={<BookOpenCheck color="" size={35} className="p-1 my-2" />} button_route="/quizscale" button_text="QuizScale (WIP)" />

            <hr className="my-3 border-neutral-800" />

            <SidebarItem button_text_color="" button_icon={<Settings color="" size={35} className="p-1 my-2" />} button_route="/settings" button_text="Settings" />
            <SidebarItem button_text_color="" button_icon={<HelpingHand color="" size={35} className="p-1 my-2" />} button_route="/help" button_text="Help" />

          </Sidebar>

          
        </div>

      </body>

    </html>

  );

}
