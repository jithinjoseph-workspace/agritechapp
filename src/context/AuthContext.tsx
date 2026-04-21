import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService, StoredAuthUser } from '../api/authService';

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: StoredAuthUser | null;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<StoredAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const [token, storedUser] = await Promise.all([
          authService.getToken(),
          authService.getUser(),
        ]);

        if (token && storedUser) {
          setUser(storedUser);
          setIsAuthenticated(true);
        } else {
          if (token || storedUser) {
            await authService.clearSession();
          }
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (data: any) => {
    const nextUser = (data?.user || data) as StoredAuthUser | null;
    if (!nextUser?.id && !nextUser?.user_id) {
      throw new Error('Login response did not include a valid user.');
    }

    await authService.saveUser(nextUser);
    setUser(nextUser);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await authService.clearSession();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
