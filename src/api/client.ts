import { session } from './session';

const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message: string, readonly status?: number, readonly retryable = false) { super(message); }
}

export function isNetworkError(error: unknown) {
  return error instanceof TypeError || (error instanceof ApiError && error.retryable);
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!baseUrl) throw new ApiError('Configure EXPO_PUBLIC_API_URL para conectar o aplicativo ao backend.');
  const token = await session.getAccessToken();
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  let response: Response;
  try { response = await fetch(`${baseUrl}${path}`, { ...init, headers }); }
  catch { throw new ApiError('Não foi possível conectar ao servidor.', undefined, true); }
  const raw = await response.text();
  const payload: unknown = raw ? safeJson(raw) : undefined;
  if (!response.ok) {
    const message = typeof payload === 'object' && payload && 'message' in payload && typeof payload.message === 'string'
      ? payload.message : `A requisição falhou (${response.status}).`;
    throw new ApiError(message, response.status);
  }
  return payload as T;
}

function safeJson(value: string): unknown { try { return JSON.parse(value); } catch { return value; } }
