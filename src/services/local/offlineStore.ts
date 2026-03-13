import { Paths, File, Directory } from 'expo-file-system';
import { Session } from '@/src/types/session';
import { AnalysisResult } from '@/src/types/analysis';

const OFFLINE_DIR_NAME = 'offline-sessions';

export interface PendingSession {
  session: Session;
  analysis: AnalysisResult | null;
  savedAt: string; // ISO date
}

function getOfflineDir(): Directory {
  return new Directory(Paths.document, OFFLINE_DIR_NAME);
}

function getFilePath(sessionId: string): File {
  return new File(getOfflineDir(), `${sessionId}.json`);
}

function ensureDir(): void {
  const dir = getOfflineDir();
  if (!dir.exists) {
    dir.create();
  }
}

/**
 * Sauvegarde une session en local (fichier JSON).
 * Utilisé quand Firestore n'est pas joignable.
 */
export async function saveSessionLocally(
  session: Session,
  analysis: AnalysisResult | null
): Promise<void> {
  ensureDir();
  const data: PendingSession = {
    session: {
      ...session,
      status: analysis ? 'completed' : session.status,
      analysis,
    },
    analysis,
    savedAt: new Date().toISOString(),
  };
  const file = getFilePath(session.id);
  file.write(JSON.stringify(data));
}

/**
 * Retourne toutes les sessions en attente de synchronisation.
 */
export async function getPendingSessions(): Promise<PendingSession[]> {
  try {
    ensureDir();
    const dir = getOfflineDir();
    const entries = dir.list();
    const jsonFiles = entries.filter(
      (entry): entry is File => entry instanceof File && entry.name.endsWith('.json')
    );

    const sessions: PendingSession[] = [];
    for (const file of jsonFiles) {
      try {
        const raw = await file.text();
        const parsed: PendingSession = JSON.parse(raw);
        // Réhydrater les dates
        parsed.session.createdAt = new Date(parsed.session.createdAt);
        if (parsed.session.analysis?.analyzedAt) {
          parsed.session.analysis.analyzedAt = new Date(parsed.session.analysis.analyzedAt);
        }
        if (parsed.analysis?.analyzedAt) {
          parsed.analysis.analyzedAt = new Date(parsed.analysis.analyzedAt);
        }
        sessions.push(parsed);
      } catch {
        // Fichier corrompu — on l'ignore
      }
    }

    return sessions.sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    );
  } catch {
    return [];
  }
}

/**
 * Supprime une session locale après synchronisation réussie.
 */
export async function removePendingSession(sessionId: string): Promise<void> {
  try {
    const file = getFilePath(sessionId);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // Silencieux — la prochaine synchro retentera
  }
}

/**
 * Nombre de sessions en attente (lecture rapide).
 */
export async function getPendingCount(): Promise<number> {
  try {
    ensureDir();
    const dir = getOfflineDir();
    const entries = dir.list();
    return entries.filter(
      (entry): entry is File => entry instanceof File && entry.name.endsWith('.json')
    ).length;
  } catch {
    return 0;
  }
}
