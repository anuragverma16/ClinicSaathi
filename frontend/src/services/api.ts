import axios from 'axios';

export const demoMode = import.meta.env.VITE_USE_MOCK_API === 'true';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        window.dispatchEvent(new Event('clinicsaathi:unauthorized'));
      }
      const body = error.response?.data;
      if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
        error.message = body.message;
      }
    }
    return Promise.reject(error);
  },
);

export function unwrap<T>(response: { data: unknown }): T {
  const body = response.data;
  if (!body || typeof body !== 'object' || !('success' in body) || body.success !== true) {
    const message = body && typeof body === 'object' && 'message' in body && typeof body.message === 'string'
      ? body.message
      : 'The API did not confirm the operation.';
    throw new Error(message);
  }
  if (!('data' in body)) throw new Error('The API response did not include saved data.');
  return body.data as T;
}
