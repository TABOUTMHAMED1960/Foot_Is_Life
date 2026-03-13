import { useState, useCallback } from 'react';
import { VideoData, VideoAngle } from '@/src/types/video';
import { uploadVideo, buildUploadMeta, UploadVideoResult } from '@/src/services/firebase/storage';
import { updateSessionVideoMeta } from '@/src/services/firebase/firestore';
import { useAuthStore } from '@/src/stores/authStore';

export interface VideoUploadProgress {
  front: number;
  back: number;
  /** Progression combinée 0-1 (moyenne pondérée des vidéos présentes) */
  overall: number;
}

export interface VideoUploadError {
  angle: VideoAngle;
  message: string;
}

interface UseVideoUploadReturn {
  progress: VideoUploadProgress;
  errors: VideoUploadError[];
  isUploading: boolean;
  /** true si au moins un upload a réussi (la séance peut être sauvegardée partiellement) */
  hasPartialSuccess: boolean;
  /**
   * Upload les vidéos vers Firebase Storage et met à jour Firestore.
   * Ne crashe jamais — les erreurs sont collectées et accessibles via `errors`.
   * Retourne true si au moins un upload a réussi.
   */
  uploadVideos: (
    sessionId: string,
    frontVideo: VideoData | null,
    backVideo: VideoData | null
  ) => Promise<boolean>;
}

export function useVideoUpload(): UseVideoUploadReturn {
  const user = useAuthStore((s) => s.user);
  const [progress, setProgress] = useState<VideoUploadProgress>({
    front: 0,
    back: 0,
    overall: 0,
  });
  const [errors, setErrors] = useState<VideoUploadError[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [hasPartialSuccess, setHasPartialSuccess] = useState(false);

  const uploadVideos = useCallback(
    async (
      sessionId: string,
      frontVideo: VideoData | null,
      backVideo: VideoData | null
    ): Promise<boolean> => {
      if (!user) {
        setErrors([{ angle: 'front', message: 'Utilisateur non connecté.' }]);
        return false;
      }

      const videosToUpload: { angle: VideoAngle; video: VideoData }[] = [];
      if (frontVideo) videosToUpload.push({ angle: 'front', video: frontVideo });
      if (backVideo) videosToUpload.push({ angle: 'back', video: backVideo });

      if (videosToUpload.length === 0) {
        // Aucune vidéo à uploader — pas une erreur, l'analyse peut continuer
        return true;
      }

      setIsUploading(true);
      setErrors([]);
      setHasPartialSuccess(false);
      setProgress({ front: 0, back: 0, overall: 0 });

      const videoCount = videosToUpload.length;
      const progressMap: Record<string, number> = { front: 0, back: 0 };
      const uploadErrors: VideoUploadError[] = [];
      let successCount = 0;

      const updateOverall = () => {
        const activeAngles = videosToUpload.map((v) => v.angle);
        const sum = activeAngles.reduce((acc, a) => acc + (progressMap[a] || 0), 0);
        const overall = sum / videoCount;
        setProgress({
          front: progressMap.front,
          back: progressMap.back,
          overall,
        });
      };

      // Upload en parallèle
      const uploadPromises = videosToUpload.map(async ({ angle, video }) => {
        try {
          const result: UploadVideoResult = await uploadVideo(
            user.uid,
            sessionId,
            angle,
            video.uri,
            (p) => {
              progressMap[angle] = p;
              updateOverall();
            }
          );

          // Mise à jour Firestore avec les métadonnées
          try {
            await updateSessionVideoMeta(sessionId, angle, {
              storagePath: result.storagePath,
              downloadURL: result.downloadURL,
              fileSize: result.fileSize,
              duration: video.duration,
            });
          } catch {
            // Firestore échoue mais le fichier est uploadé —
            // on le considère comme un succès partiel
            uploadErrors.push({
              angle,
              message: `Vidéo ${angle === 'front' ? 'de face' : 'de dos'} envoyée, mais la sauvegarde des métadonnées a échoué.`,
            });
          }

          progressMap[angle] = 1;
          updateOverall();
          successCount++;
        } catch (err: any) {
          progressMap[angle] = 0;
          updateOverall();

          const baseMsg =
            angle === 'front'
              ? 'Échec de l\'envoi de la vidéo de face'
              : 'Échec de l\'envoi de la vidéo de dos';

          let detail = '';
          if (err?.code === 'storage/unauthorized') {
            detail = ' : permissions insuffisantes.';
          } else if (err?.code === 'storage/canceled') {
            detail = ' : envoi annulé.';
          } else if (err?.code === 'storage/retry-limit-exceeded') {
            detail = ' : connexion instable, réessaie plus tard.';
          } else if (err?.message?.includes('fetch')) {
            detail = ' : fichier vidéo introuvable localement.';
          } else {
            detail = '. Vérifie ta connexion et réessaie.';
          }

          uploadErrors.push({ angle, message: baseMsg + detail });
        }
      });

      await Promise.all(uploadPromises);

      setErrors(uploadErrors);
      const partial = successCount > 0;
      setHasPartialSuccess(partial);
      setIsUploading(false);

      return partial || videosToUpload.length === 0;
    },
    [user]
  );

  return {
    progress,
    errors,
    isUploading,
    hasPartialSuccess,
    uploadVideos,
  };
}
