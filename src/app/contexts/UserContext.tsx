'use client';
import { createContext, useState, useContext } from 'react';

interface User {

    firstName: string;
    lastName: string;
    picture: string;

}

const UserContext = createContext<{

    user: User | null;
    setUser: (user: User | null) => void;
    handleGoogleLogOut: () => void;

}>({

    user: null,
    setUser: (user: User | null) => {},
    handleGoogleLogOut: () => {},

});

export const UserProvider = ({children}: {children: React.ReactNode}) => {

    const [user, setUser] = useState<User | null>(null);

    const handleGoogleLogOut = () => {

        localStorage.removeItem('googleJWT');
        setUser(null);

    };
    
    return(

        <UserContext.Provider value = { {user, setUser, handleGoogleLogOut }}>

            {children};

        </UserContext.Provider>

    );

};

export const useUser = () => useContext(UserContext);