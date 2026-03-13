import { useState, useEffect, useCallback } from 'react';
import { Session } from '@/src/types/session';
import {
  getUserSessions,
  getSession,
  createSession,
  deleteSessionDoc,
  updateSessionAnalysis,
  updateUserStats,
} from '@/src/services/firebase/firestore';
import { deleteSessionVideos } from '@/src/services/firebase/storage';
import { useAuthStore } from '@/src/stores/authStore';

export function useSession() {
  const user = useAuthStore((s) => s.user);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserSessions(user.uid);
      setSessions(data);
    } catch {
      setError('Impossible de charger les séances.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchSession = useCallback(async (sessionId: string): Promise<Session | null> => {
    try {
      return await getSession(sessionId);
    } catch {
      return null;
    }
  }, []);

  const saveSession = useCallback(async (session: Session) => {
    try {
      await createSession(session);
    } catch (err) {
      setError('Impossible de sauvegarder la séance.');
      throw err;
    }
  }, []);

  const saveAnalysis = useCallback(async (sessionId: string, analysis: any) => {
    try {
      await updateSessionAnalysis(sessionId, analysis);
      // Rafraîchir les sessions et mettre à jour les stats
      if (user) {
        const updatedSessions = await getUserSessions(user.uid);
        setSessions(updatedSessions);
        await updateUserStats(user.uid, updatedSessions);
      }
    } catch (err) {
      setError("Impossible de sauvegarder l'analyse.");
      throw err;
    }
  }, [user]);

  const deleteSession = useCallback(async (session: Session) => {
    setError(null);
    try {
      // Collecter les chemins Storage des vidéos uploadées
      const storagePaths: string[] = [];
      if (session.videos.front?.uploadMeta?.storagePath) {
        storagePaths.push(session.videos.front.uploadMeta.storagePath);
      }
      if (session.videos.back?.uploadMeta?.storagePath) {
        storagePaths.push(session.videos.back.uploadMeta.storagePath);
      }

      // Supprimer les vidéos dans Storage (best-effort, ne bloque pas la suite)
      if (storagePaths.length > 0) {
        try {
          await deleteSessionVideos(storagePaths);
        } catch {
          // Les vidéos n'ont pas pu être supprimées — on continue
        }
      }

      // Supprimer le document Firestore
      await deleteSessionDoc(session.id);

      // Rafraîchir les sessions et mettre à jour les stats
      if (user) {
        const updatedSessions = await getUserSessions(user.uid);
        setSessions(updatedSessions);
        await updateUserStats(user.uid, updatedSessions);
      }
    } catch (err) {
      setError('Impossible de supprimer la séance.');
      throw err;
    }
  }, [user]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    isLoading,
    error,
    fetchSessions,
    fetchSession,
    saveSession,
    saveAnalysis,
    deleteSession,
  };
}
