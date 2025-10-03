import { UserProvider } from "./contexts/UserContext";
import { CalendarProvider } from "./contexts/SelectedCalendarContext";
import Script from "next/script";
import "./globals.css";
import LoadingWrapper from "./LoadingWrapper";

// @todo make an actual landing page not just the dashboard/login

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <title>GeckoAI</title>
                <link rel="icon" type="image/svg+xml" href="/logoAnimated.svg" />
            </head>

            <body>
                <Script
                    src="https://accounts.google.com/gsi/client"
                    async
                    strategy="afterInteractive"
                />

                <UserProvider>
                    <CalendarProvider>
                        <LoadingWrapper>{children}</LoadingWrapper>
                    </CalendarProvider>
                </UserProvider>
            </body>
        </html>
    );
}
