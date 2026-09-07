import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const TOKEN_KEY = 'chamsuri_auth_token';

interface AuthContextValue {
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(TOKEN_KEY).then((token) => {
      setIsLoggedIn(!!token);
      setIsLoading(false);
    });
  }, []);

  async function login(token: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    setIsLoggedIn(true);
  }

  async function logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setIsLoggedIn(false);
  }

  return (
    <AuthContext.Provider value={{ isLoading, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
