'use client';
import { createContext, useState, useEffect, useContext } from 'react';
import { usePathname, useRouter } from "next/navigation";

interface User {

  name: string;
  firstName: string;
  email: string;
  picture: string;

}

interface UserContextType {

  user: User | null;
  loading: boolean;
  GoogleLogIn: () => void;
  GoogleLogOut: () => Promise<void>;

}

const UserContext = createContext<UserContextType>({

  user: null,
  loading: true,
  GoogleLogIn: () => {},
  GoogleLogOut: async () => {}

});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathName = usePathname();

  useEffect(() => {

    const fetchUser = async () => {

      try {

        const res = await fetch('/api/me', { credentials: 'include' });

        if (res.ok) {

          const userData = await res.json();

          if (userData) {

            setUser(userData);

          }

        }

      } 
      catch (error) {

        console.error('Failed to fetch user:', error);

      } 
      finally {

        setLoading(false);

      }

    };

    fetchUser();
    
  }, []);

  const GoogleLogIn = () => {
    
    const next = encodeURIComponent('/taillink');
    window.location.href = `/api/auth/google?next=${next}`;

  };

  const GoogleLogOut = async () => {

    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    router.replace('/');

  };

  return (

    <UserContext.Provider value={{ user, loading, GoogleLogIn, GoogleLogOut }}>

      {children}

    </UserContext.Provider>

  );

};

export const useUser = () => useContext(UserContext);