import { useEffect, useRef, useCallback, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { syncPendingSessions, SyncResult } from '@/src/services/local/syncService';
import { createSession, updateSessionAnalysis, updateSessionVideoMeta } from '@/src/services/firebase/firestore';
import { uploadVideo } from '@/src/services/firebase/storage';
import { getPendingCount } from '@/src/services/local/offlineStore';

/**
 * Hook qui écoute le retour de connexion réseau et synchronise
 * les séances hors-ligne en attente (données + vidéos).
 *
 * Doit être monté dans un composant qui persiste tant que l'utilisateur
 * est authentifié (ex: tabs layout).
 */
export function useOfflineSync() {
  const wasOffline = useRef(false);
  const isSyncing = useRef(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  const refreshCount = useCallback(async () => {
    const count = await getPendingCount();
    setPendingCount(count);
  }, []);

  const doSync = useCallback(async () => {
    if (isSyncing.current) return;
    isSyncing.current = true;

    try {
      const result = await syncPendingSessions({
        saveSession: createSession,
        saveAnalysis: updateSessionAnalysis,
        uploadVideo,
        updateVideoMeta: updateSessionVideoMeta,
      });

      setLastSyncResult(result);
      await refreshCount();
    } catch {
      // Erreur globale de synchro — on laisse en attente
    } finally {
      isSyncing.current = false;
    }
  }, [refreshCount]);

  useEffect(() => {
    // Vérifier au montage s'il y a des sessions en attente
    refreshCount();

    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const isConnected = state.isConnected ?? false;

      if (!isConnected) {
        wasOffline.current = true;
        return;
      }

      // Le réseau vient de revenir (ou on vient de monter avec du réseau)
      if (wasOffline.current || !wasOffline.current) {
        // On tente une synchro à chaque connexion détectée
        // (wasOffline = false au montage → synchro initiale aussi)
        wasOffline.current = false;
        doSync();
      }
    });

    return unsubscribe;
  }, [doSync, refreshCount]);

  return { pendingCount, lastSyncResult, retrySync: doSync };
}
