import NetInfo from '@react-native-community/netinfo';
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { flushSyncQueue, pendingSyncCount } from './sync';

type OfflineState = { isOnline: boolean; pendingChanges: number; syncNow: () => Promise<void> };
const OfflineContext = createContext<OfflineState | undefined>(undefined);

export function OfflineProvider({ children }: PropsWithChildren) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingChanges, setPendingChanges] = useState(0);
  const syncNow = async () => { if (!isOnline) return; await flushSyncQueue(); setPendingChanges(await pendingSyncCount()); };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(online);
    });
    return unsubscribe;
  }, []);
  const value = useMemo(() => ({ isOnline, pendingChanges, syncNow }), [isOnline, pendingChanges]);
  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) throw new Error('useOffline deve ser usado dentro de OfflineProvider.');
  return context;
}
