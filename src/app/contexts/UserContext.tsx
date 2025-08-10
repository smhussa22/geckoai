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
  GoogleLogOut: () => void;
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

  const GoogleLogIn = () => {


  };

  const GoogleLogOut = () => {
    

  };

  return ( <UserContext.Provider value={{ user, isLoading, GoogleLogIn, GoogleLogOut }}> {children} </UserContext.Provider> );

};

export const useUser = () => useContext(UserContext);
