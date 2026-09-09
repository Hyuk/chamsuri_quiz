import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { loginWithGoogleIdToken, type AuthUser } from '@/api/auth';
import { setAccessToken, setUnauthorizedHandler, USE_MOCK } from '@/api/client';
import { signInWithGoogle, signOutGoogle } from '@/lib/googleSignIn';

const TOKEN_KEY = 'chamsuri_auth_token';
const USER_KEY = 'chamsuri_auth_user';

interface AuthContextValue {
  isLoading: boolean;
  isLoggedIn: boolean;
  user: AuthUser | null;
  /** 구글 로그인 시트를 띄운다. 사용자가 취소하면 false. */
  loginWithGoogle: () => Promise<boolean>;
  /** 백엔드 없이 동작하는 개발용 로그인. USE_MOCK일 때만 노출한다. */
  loginMock: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function persistSession(token: string, user: AuthUser) {
  setAccessToken(token);
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

async function clearSession() {
  setAccessToken(null);
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    (async () => {
      const [token, storedUser] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);
      if (token && storedUser) {
        setAccessToken(token);
        setUser(JSON.parse(storedUser) as AuthUser);
      }
      setIsLoading(false);
    })();
  }, []);

  const logout = useCallback(async () => {
    await Promise.all([clearSession(), signOutGoogle()]);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const loginWithGoogle = useCallback(async () => {
    const idToken = await signInWithGoogle();
    if (!idToken) return false;
    const auth = await loginWithGoogleIdToken(idToken);
    await persistSession(auth.accessToken, auth.user);
    setUser(auth.user);
    return true;
  }, []);

  const loginMock = useCallback(async () => {
    const auth = await loginWithGoogleIdToken('mock-id-token');
    await persistSession(auth.accessToken, auth.user);
    setUser(auth.user);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ isLoading, isLoggedIn: user !== null, user, loginWithGoogle, loginMock, logout }),
    [isLoading, user, loginWithGoogle, loginMock, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export const canUseMockLogin = USE_MOCK;
