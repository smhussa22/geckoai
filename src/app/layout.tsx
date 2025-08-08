import { UserProvider } from "./contexts/UserContext";
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (

    <html lang="en">

      <head>

        <title>GeckoAI</title>
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />

      </head>

      <body>
        <Script src="https://accounts.google.com/gsi/client" async strategy="afterInteractive" />

        <UserProvider>

          {children}

        </UserProvider>

      </body>

    </html>

  );
}
