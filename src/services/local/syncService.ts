import {
  getPendingSessions,
  removePendingSession,
  PendingSession,
} from './offlineStore';
import { Session } from '@/src/types/session';
import { AnalysisResult } from '@/src/types/analysis';

export interface SyncDeps {
  saveSession: (session: Session) => Promise<void>;
  saveAnalysis: (sessionId: string, analysis: AnalysisResult) => Promise<void>;
}

export interface SyncResult {
  synced: number;
  failed: number;
}

/**
 * Synchronise toutes les séances en attente vers Firestore.
 * Chaque séance est traitée indépendamment : un échec n'empêche pas
 * la synchronisation des autres.
 */
export async function syncPendingSessions(deps: SyncDeps): Promise<SyncResult> {
  const pending = await getPendingSessions();

  if (pending.length === 0) {
    return { synced: 0, failed: 0 };
  }

  let synced = 0;
  let failed = 0;

  for (const entry of pending) {
    try {
      await syncOne(entry, deps);
      await removePendingSession(entry.session.id);
      synced++;
    } catch {
      failed++;
    }
  }

  return { synced, failed };
}

async function syncOne(entry: PendingSession, deps: SyncDeps): Promise<void> {
  // 1. Créer la session dans Firestore
  await deps.saveSession(entry.session);

  // 2. Sauvegarder l'analyse si elle existe
  if (entry.analysis) {
    await deps.saveAnalysis(entry.session.id, entry.analysis);
  }
}
