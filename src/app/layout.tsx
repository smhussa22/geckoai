import { UserProvider } from "./contexts/UserContext";
import Script from 'next/script';
import Logo from 'public/logo.svg';
export default function RootLayout({children}: { children: React.ReactNode; }) {

  return (

    <html lang="en">

        <head>

          <title>GeckoAI</title>
          <link rel = "icon" type = "image/x-icon" href = "logo.svg"/>

        </head>

        <body>

          <Script src="https://accounts.google.com/gsi/client" async strategy="afterInteractive"></Script>
          <UserProvider>
            {children}
          </UserProvider>

        </body>


    </html>

  );

}
