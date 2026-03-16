import {
  getPendingSessions,
  removePendingSession,
  PendingSession,
} from './offlineStore';
import { Session } from '@/src/types/session';
import { AnalysisResult } from '@/src/types/analysis';
import { VideoAngle } from '@/src/types/video';

export interface UploadResult {
  storagePath: string;
  downloadURL: string;
  fileSize: number | null;
}

export interface VideoMeta {
  storagePath: string;
  downloadURL: string;
  fileSize: number | null;
  duration: number;
}

export interface SyncDeps {
  saveSession: (session: Session) => Promise<void>;
  saveAnalysis: (sessionId: string, analysis: AnalysisResult) => Promise<void>;
  /** Upload une vidéo vers Storage. Si absent, l'upload est ignoré. */
  uploadVideo?: (
    userId: string,
    sessionId: string,
    angle: VideoAngle,
    localUri: string
  ) => Promise<UploadResult>;
  /** Met à jour les métadonnées vidéo dans Firestore après upload. */
  updateVideoMeta?: (
    sessionId: string,
    angle: VideoAngle,
    meta: VideoMeta
  ) => Promise<void>;
}

export interface SyncResult {
  synced: number;
  failed: number;
  videosUploaded: number;
  videosFailed: number;
}

/**
 * Synchronise toutes les séances en attente vers Firestore.
 * Chaque séance est traitée indépendamment : un échec n'empêche pas
 * la synchronisation des autres.
 *
 * Si uploadVideo et updateVideoMeta sont fournis, tente aussi
 * l'upload des vidéos locales (best-effort, ne bloque pas la synchro).
 */
export async function syncPendingSessions(deps: SyncDeps): Promise<SyncResult> {
  const pending = await getPendingSessions();

  if (pending.length === 0) {
    return { synced: 0, failed: 0, videosUploaded: 0, videosFailed: 0 };
  }

  let synced = 0;
  let failed = 0;
  let videosUploaded = 0;
  let videosFailed = 0;

  for (const entry of pending) {
    try {
      await syncData(entry, deps);

      // Upload vidéos (best-effort — un échec ne remet pas en cause la synchro data)
      const videoResult = await syncVideos(entry, deps);
      videosUploaded += videoResult.uploaded;
      videosFailed += videoResult.failed;

      await removePendingSession(entry.session.id);
      synced++;
    } catch {
      failed++;
    }
  }

  return { synced, failed, videosUploaded, videosFailed };
}

/**
 * Synchronise les données Firestore (session + analyse).
 * Lève une erreur si la sauvegarde échoue.
 */
async function syncData(entry: PendingSession, deps: SyncDeps): Promise<void> {
  await deps.saveSession(entry.session);

  if (entry.analysis) {
    await deps.saveAnalysis(entry.session.id, entry.analysis);
  }
}

/**
 * Tente l'upload des vidéos locales associées à une séance.
 * Best-effort : ne lève jamais d'erreur.
 */
async function syncVideos(
  entry: PendingSession,
  deps: SyncDeps
): Promise<{ uploaded: number; failed: number }> {
  if (!deps.uploadVideo || !deps.updateVideoMeta) {
    return { uploaded: 0, failed: 0 };
  }

  const { session } = entry;
  const videos: { angle: VideoAngle; uri: string; duration: number }[] = [];

  if (session.videos.front?.uri) {
    videos.push({
      angle: 'front',
      uri: session.videos.front.uri,
      duration: session.videos.front.duration,
    });
  }
  if (session.videos.back?.uri) {
    videos.push({
      angle: 'back',
      uri: session.videos.back.uri,
      duration: session.videos.back.duration,
    });
  }

  let uploaded = 0;
  let failed = 0;

  for (const video of videos) {
    try {
      const result = await deps.uploadVideo(
        session.userId,
        session.id,
        video.angle,
        video.uri
      );

      await deps.updateVideoMeta(session.id, video.angle, {
        storagePath: result.storagePath,
        downloadURL: result.downloadURL,
        fileSize: result.fileSize,
        duration: video.duration,
      });

      uploaded++;
    } catch {
      // Fichier local manquant, réseau instable, etc.
      // On ne bloque pas — la séance data est déjà synchronisée.
      failed++;
    }
  }

  return { uploaded, failed };
}
