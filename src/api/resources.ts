import { apiFetch } from './client';

export type Epi = { id: number; nr_registro_ca: string; data_validade: string; situacao: string; razao_social: string; equipamento: string };
export type Job = { id: number; nome: string; descricao: string | null; epis: { epi_id: number; equipamento: string; periodicidade: 'dias' | 'outros'; quantidade_dias: number | null }[] };
export type Worker = { id: number; nome: string; cpf: string; matricula: string; funcao: string; setor: string; epis_recomendados: string[] };
export type Supplier = { id: number; razao_social: string; nome_fantasia: string; cnpj: string; contato: string; telefone: string; email: string; cidade: string; uf: string };
export type Profile = { id: number; nome: string; email: string; telefone: string | null };
export type Invoice = { id: number; chave: string; dados: Record<string, unknown>; created_at: string };
export const unwrap = <T,>(response: T | { data: T }): T => response && typeof response === 'object' && 'data' in response ? response.data : response as T;
export function jsonRequest<T = unknown>(path: string, method: 'POST' | 'PATCH' | 'DELETE', body?: unknown) {
  return apiFetch<T>(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });
}
export async function listPage<T>(path: string, page = 1): Promise<{ items: T[]; hasMore: boolean }> {
  const response = await apiFetch<unknown>(`${path}${path.includes('?') ? '&' : '?'}page=${page}`);
  if (Array.isArray(response)) return { items: response, hasMore: false };
  let value = response as { data?: unknown; items?: T[]; current_page?: number; last_page?: number; meta?: { current_page: number; last_page: number } };
  if (value?.data && !Array.isArray(value.data)) value = value.data as typeof value;
  const items = value?.data ?? value?.items;
  if (!Array.isArray(items)) throw new Error('O servidor retornou uma lista inválida.');
  const meta = value.meta ?? value;
  return { items, hasMore: Number(meta.current_page ?? page) < Number(meta.last_page ?? page) };
}
