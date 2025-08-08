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
  GoogleLogIn: () => void;
  GoogleLogOut: () => Promise<void>;
  isLoading: boolean;

}

const UserContext = createContext<UserContextType>({

  user: null,
  isLoading: true,
  GoogleLogIn: () => {},
  GoogleLogOut: async () => {},

});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {

    (
      
      async () => {

        try{ 

          const response = await fetch('');



        }

        catch {



        } 

        finally {



        }

      })();

  }, []);

  const GoogleLogIn = () => {

    const oAuth2 = (window as any)?.google?.accounts?.oauth2;
    if(!oAuth2) return console.error("GIS Failed");

    const codeClient = oAuth2.initCodeClient({

      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      scope: 'openid email profile https://www.googleapis.com/auth/calendar',
      ux_mode: 'redirect',
      prompt: 'consent',
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL!}/api/auth/google/callback`


    });

    codeClient.requestCode();

  };

  const GoogleLogOut = () => {



  };

  return ( <UserContext.Provider value={{ user, isLoading, GoogleLogIn, GoogleLogOut }}> {children} </UserContext.Provider> );

};

export const useUser = () => useContext(UserContext);
