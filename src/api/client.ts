const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
const USE_MOCK = !API_BASE_URL;

export { USE_MOCK };

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${path}`);
  }

  return response.json() as Promise<T>;
}
