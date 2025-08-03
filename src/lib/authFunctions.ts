import { useEffect } from "react";

export const handleCredentialResponse = (response: any) => {

    console.log("Encoded JWT ID token: " + response.credential);

}

export const handleGoogleLogIn = () => {

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

    if(!clientId) { 

        console.error("Google Client ID is inaccessible.")
        return;

    }

    (window as any).google.accounts.id.initialize({

        client_id: clientId,
        callback: handleCredentialResponse

    });

    (window as any).google.accounts.id.prompt();

}
