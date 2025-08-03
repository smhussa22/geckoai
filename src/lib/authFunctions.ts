import { useUser } from "@/app/contexts/UserContext";

export const handleCredentialResponse = (response: any) => {

    if(!response || !response.credential){

        console.log("Server responded with no token");
        return;
    
    }

    localStorage.setItem('googleJWT', response.credential);

    const userObject = JSON.parse(atob(response.credential.split('.')[1]));
    console.log(userObject);

    const userInfo = {

        picture: userObject.picture,
        name: userObject.given_name,
        lastName: userObject.family_name

    }

    console.log(userInfo);

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
