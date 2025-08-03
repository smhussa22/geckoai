'use client';
import { createContext, useState, useEffect, useContext } from 'react';

interface User {

    name: string;
    email: string;
    picture: string;

}

interface UserContextType {

    user: User | null,
    GoogleLogIn: () => void;
    GoogleLogOut: () => void;

}

const UserContext = createContext<UserContextType>({

    user: null,
    GoogleLogIn: () => {},
    GoogleLogOut: () => {}

});

export const UserProvider = ({children}: {children: React.ReactNode}) => {

    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {

        const token = localStorage.getItem('googleJWT');
        if (!token) return;

        try{

            const userObject = JSON.parse(atob(token.split('.')[1]));
            
            setUser({

                picture: userObject.picture,
                name: userObject.name,
                email: userObject.email

            });

        }
        catch(error: any){

            console.error(error);

        }

    }, []);

    const GoogleLogIn = () => {

        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

        if(!clientId) return console.error("Google Client ID is inaccessible.");

        (window as any).google.accounts.id.initialize({

            client_id: clientId,
            callback: (response: any) => {

                if (!response || !response.credential) return null;

                localStorage.setItem('googleJWT', response.credential);

                const userObject = JSON.parse(atob(response.credential.split('.')[1]));

                const userInfo = {

                    picture: userObject.picture,
                    name: userObject.name,
                    email: userObject.email

                };

                setUser(userInfo);

            }      

        });

        (window as any).google.accounts.id.prompt();

    }

    const GoogleLogOut = () => {

        localStorage.removeItem('googleJWT');
        setUser(null);

    }

    return (

        <UserContext.Provider value = {{ user, GoogleLogIn, GoogleLogOut}}>

            {children}

        </UserContext.Provider>

    );

};

export const useUser = () => useContext(UserContext);