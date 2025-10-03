import type { Metadata } from "next";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../globals.css";
import "react-tooltip/dist/react-tooltip.css";
import LoadingWrapper from "../LoadingWrapper";

export const metadata: Metadata = {
    title: "GeckoAI",
    description: "A study tool by Syed Maroof Hussain",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen">
            <Sidebar />

            <div className="flex flex-1 flex-col">
                <Header />

                <main className="relative flex-1 overflow-y-auto p-4">{children}</main>
            </div>
        </div>
    );
}
