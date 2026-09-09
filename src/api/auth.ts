import { apiFetch, USE_MOCK } from '@/api/client';

export interface AuthUser {
  id: number;
  nickname: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresAt: string;
  user: AuthUser;
  isNewUser: boolean;
}

export async function loginWithGoogleIdToken(idToken: string): Promise<AuthResponse> {
  if (USE_MOCK) {
    return {
      accessToken: 'mock-token',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      user: { id: 1, nickname: '참수리', email: 'mock@example.com' },
      isNewUser: false,
    };
  }
  return apiFetch<AuthResponse>('/v1/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
}
