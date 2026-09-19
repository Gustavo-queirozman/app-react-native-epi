import { getDatabase } from '../data/database';

export type CachedEntity = { id: string | number; [key: string]: unknown };

export async function cacheCollection<T extends CachedEntity>(resource: string, entities: T[]) {
  const db = await getDatabase();
  const now = Date.now();
  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync('DELETE FROM resource_cache WHERE resource = ?', resource);
    for (const entity of entities) {
      await tx.runAsync('INSERT OR REPLACE INTO resource_cache (resource, resource_id, data, updated_at) VALUES (?, ?, ?, ?)', resource, String(entity.id), JSON.stringify(entity), now);
    }
  });
}

export async function cacheEntity<T extends CachedEntity>(resource: string, entity: T) {
  const db = await getDatabase();
  await db.runAsync('INSERT OR REPLACE INTO resource_cache (resource, resource_id, data, updated_at) VALUES (?, ?, ?, ?)', resource, String(entity.id), JSON.stringify(entity), Date.now());
}

export async function removeCachedEntity(resource: string, id: string | number) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM resource_cache WHERE resource = ? AND resource_id = ?', resource, String(id));
}

export async function getCachedCollection<T>(resource: string): Promise<T[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ data: string }>('SELECT data FROM resource_cache WHERE resource = ? ORDER BY updated_at DESC', resource);
  return rows.map((row) => JSON.parse(row.data) as T);
}
