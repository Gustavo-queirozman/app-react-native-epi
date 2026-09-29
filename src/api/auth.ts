import { apiFetch } from './client';
import { endpoints } from './endpoints';
import { session } from './session';

type AuthResponse = { accessToken?: string; token?: string };

export async function login(email: string, password: string) {
  const response = await apiFetch<AuthResponse>(endpoints.auth.login, { method: 'POST', body: JSON.stringify({ email, password }) });
  const token = response?.accessToken ?? response?.token;
  if (typeof token !== 'string' || !token.trim()) throw new Error('O servidor não retornou o token de acesso.');
  await session.setAccessToken(token);
  return token;
}

export async function registerCompany(payload: { companyName: string; cnpj: string; responsibleName: string; email: string; password: string }) {
  const response = await apiFetch<AuthResponse>(endpoints.auth.register, { method: 'POST', body: JSON.stringify({ nome_empresa: payload.companyName, cnpj: payload.cnpj, nome_responsavel: payload.responsibleName, email: payload.email, password: payload.password }) });
  const token = response.accessToken ?? response.token;
  if (typeof token !== 'string' || !token.trim()) throw new Error('O servidor não retornou o token de acesso.');
  await session.setAccessToken(token);
}

export function requestPasswordReset(email: string) {
  return apiFetch<void>(endpoints.auth.forgotPassword, { method: 'POST', body: JSON.stringify({ email }) });
}

export function resetPassword(email: string, token: string, password: string, confirmation: string) {
  return apiFetch(endpoints.auth.resetPassword, { method: 'POST', body: JSON.stringify({ email, token, password, password_confirmation: confirmation }) });
}
