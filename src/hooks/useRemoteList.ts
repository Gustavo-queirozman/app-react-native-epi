import { useCallback, useEffect, useRef, useState } from 'react';
import { listPage } from '../api/resources';

export function useRemoteList<T>(path: string, enabled = true) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const request = ++generation.current;
    setLoading(true); setError('');
    try {
      const all: T[] = [];
      let page = 1;
      while (true) {
        const result = await listPage<T>(path, page++);
        if (request !== generation.current) return;
        all.push(...result.items);
        if (!result.hasMore) break;
      }
      setItems(all);
    } catch (reason) { if (request === generation.current) setError(reason instanceof Error ? reason.message : 'Falha ao carregar dados.'); }
    finally { if (request === generation.current) setLoading(false); }
  }, [path]);
  useEffect(() => {
    setItems([]);
    if (enabled) void refresh();
    return () => { generation.current++; };
  }, [enabled, refresh]);
  return { items, loading, error, refresh };
}
