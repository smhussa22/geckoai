'use client';
import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from "next/navigation";

interface User {

  name: string;
  firstName: string;
  email: string;
  picture: string;

}

interface UserContextType {

  user: User | null;
  firstName: string | null;
  GoogleLogIn: () => void;
  GoogleLogOut: () => void;

}

const UserContext = createContext<UserContextType>({

  user: null,
  firstName: null,
  GoogleLogIn: () => {},
  GoogleLogOut: () => {},

});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {

  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {

    const token = localStorage.getItem('googleJWT');

    if (!token) return console.error("Could not fetch token");

    const userObject = JSON.parse(atob(token.split('.')[1]));

    setUser({

      name: userObject.name,
      firstName: userObject.given_name,
      email: userObject.email,
      picture: userObject.picture,

    });

    setFirstName(userObject.given_name);

  }, []);

  const GoogleLogIn = () => {

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

    if (!clientId || !(window as any).google) return console.error("Could not fetch client ID or Google script");

    (window as any).google.accounts.id.initialize({

        client_id: clientId,
        callback: (response: any) => {

        if (!response || !response?.credential) return console.error("Could not fetch response or it's credential");

        localStorage.setItem('googleJWT', response.credential);
        window.location.href = "/taillink"; 

    },
      ux_mode: "redirect",
      login_uri: "http://localhost:3000/taillink", 

    });

    (window as any).google.accounts.id.prompt();
    console.log(user);

  };

  const GoogleLogOut = () => {

    localStorage.removeItem("googleJWT");
    setUser(null);
    setFirstName(null);

    (window as any)?.google?.accounts?.id?.disableAutoSelect?.();

    if (user?.email) {

      (window as any)?.google?.accounts?.id?.revoke?.(user.email, () => {});

    }

    router.replace('/');

  };

  return (<UserContext.Provider value={{ user, firstName, GoogleLogIn, GoogleLogOut }}> {children} </UserContext.Provider>);

};

export const useUser = () => useContext(UserContext);
