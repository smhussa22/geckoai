import { UserProvider } from "./contexts/UserContext";
import  Script from 'next/script';

export default function RootLayout({children}: { children: React.ReactNode; }) {

  return (

    <html lang="en">

        <body>

          <Script src="https://accounts.google.com/gsi/client" async strategy="afterInteractive"></Script>
          <UserProvider>
            {children}
          </UserProvider>

        </body>


    </html>

  );

}
