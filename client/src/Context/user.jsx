import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

// Create context for user
export const UserContext = createContext();

// Create a provider component
export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);

  // Maintain user on refresh
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!user) {
          const { data } = await axios.get('/profile');
          setUser(data);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}