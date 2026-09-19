import { apiFetch, isNetworkError } from '../api/client';
import { getDatabase } from '../data/database';

type QueueItem = { id: string; method: string; path: string; body: string | null; attempts: number };

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export async function enqueueMutation(method: string, path: string, body?: unknown) {
  const db = await getDatabase();
  await db.runAsync('INSERT INTO sync_queue (id, method, path, body, created_at) VALUES (?, ?, ?, ?, ?)', createId(), method, path, body === undefined ? null : JSON.stringify(body), Date.now());
}

export async function pendingSyncCount() {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM sync_queue');
  return result?.count ?? 0;
}

export async function flushSyncQueue() {
  const db = await getDatabase();
  const items = await db.getAllAsync<QueueItem>('SELECT id, method, path, body, attempts FROM sync_queue ORDER BY created_at');
  for (const item of items) {
    try {
      await apiFetch(item.path, { method: item.method, body: item.body ?? undefined });
      await db.runAsync('DELETE FROM sync_queue WHERE id = ?', item.id);
    } catch (error) {
      await db.runAsync('UPDATE sync_queue SET attempts = ?, last_error = ? WHERE id = ?', item.attempts + 1, error instanceof Error ? error.message : 'Erro desconhecido', item.id);
      if (isNetworkError(error)) break;
    }
  }
}
