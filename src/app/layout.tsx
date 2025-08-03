export default function RootLayout({children}: { children: React.ReactNode; }) {

  return (

    <html lang="en">

        <body>

            <script src="https://accounts.google.com/gsi/client" async></script>
            {children}

        </body>


    </html>

  );

}
