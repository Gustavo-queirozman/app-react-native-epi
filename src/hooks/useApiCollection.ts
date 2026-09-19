import { useCallback, useEffect, useState } from 'react';
import { apiFetch, isNetworkError } from '../api/client';
import { cacheCollection, cacheEntity, getCachedCollection, removeCachedEntity, type CachedEntity } from '../offline/repository';
import { enqueueMutation } from '../offline/sync';
import { useOffline } from '../offline/OfflineProvider';

type CollectionResponse<T> = T[] | { data: T[] } | { items: T[] };
const asList = <T,>(value: CollectionResponse<T>) => {
  if (Array.isArray(value)) return value;
  if ('data' in value) return value.data;
  return value.items;
};

export function useApiCollection<T extends CachedEntity>(resource: string, path: string) {
  const { isOnline, syncNow } = useOffline();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      if (!isOnline) throw new TypeError('offline');
      const remote = asList(await apiFetch<CollectionResponse<T>>(path));
      await cacheCollection(resource, remote); setItems(remote);
    } catch (reason) {
      const cached = await getCachedCollection<T>(resource); setItems(cached);
      if (!cached.length && !isNetworkError(reason)) setError(reason instanceof Error ? reason.message : 'Não foi possível carregar os dados.');
    } finally { setLoading(false); }
  }, [isOnline, path, resource]);
  useEffect(() => { void refresh(); }, [refresh]);

  const mutate = useCallback(async (method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', mutationPath: string, body?: unknown, optimistic?: T) => {
    if (optimistic) { await cacheEntity(resource, optimistic); setItems((current) => [optimistic, ...current.filter((item) => item.id !== optimistic.id)]); }
    if (method === 'DELETE') { const id = mutationPath.split('/').at(-1); if (id) { await removeCachedEntity(resource, id); setItems((current) => current.filter((item) => String(item.id) !== id)); } }
    try {
      if (!isOnline) throw new TypeError('offline');
      await apiFetch(mutationPath, { method, body: body === undefined ? undefined : JSON.stringify(body) });
      await refresh();
    } catch (reason) {
      if (!isNetworkError(reason)) throw reason;
      await enqueueMutation(method, mutationPath, body);
      await syncNow();
    }
  }, [isOnline, refresh, resource, syncNow]);
  return { items, loading, error, refresh, mutate, isOffline: !isOnline };
}
