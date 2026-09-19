import { apiFetch } from './client';
import { endpoints } from './endpoints';
import { session } from './session';

type AuthResponse = { accessToken?: string; token?: string };

export async function login(email: string, password: string) {
  const response = await apiFetch<AuthResponse>(endpoints.auth.login, { method: 'POST', body: JSON.stringify({ email, password }) });
  const token = response.accessToken ?? response.token;
  if (!token) throw new Error('O servidor não retornou o token de acesso.');
  await session.setAccessToken(token);
  return token;
}

export async function registerCompany(payload: { companyName: string; cnpj: string; responsibleName: string; email: string; password: string }) {
  const response = await apiFetch<AuthResponse>(endpoints.auth.register, { method: 'POST', body: JSON.stringify(payload) });
  const token = response.accessToken ?? response.token;
  if (token) await session.setAccessToken(token);
}

export function requestPasswordReset(email: string) {
  return apiFetch<void>(endpoints.auth.forgotPassword, { method: 'POST', body: JSON.stringify({ email }) });
}
