import type { Metadata } from "next";
import DashboardButton from '@/app/components/DashboardButton';
import { BiCloudUpload } from "react-icons/bi";
import { IoCalendarClearOutline } from "react-icons/io5";

export const metadata: Metadata = {

  title: "GeckoAI - TailLink",
  description: "Your semester, built seamlessly.",

};

export default function TailLinkPage() {

  return (

    <>

      <h1 className="text-asparagus text-3xl font-semibold">Calendar Tools</h1>
  
        <DashboardButton name="Create Calendar" description = "Create a new calendar"/>

      <h1 className="text-asparagus text-3xl font-semibold">Select Calendars</h1>
      

    </>
  
  );

}