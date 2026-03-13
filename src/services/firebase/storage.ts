import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';
import { VideoAngle, VideoUploadMeta } from '@/src/types/video';

export interface UploadVideoResult {
  storagePath: string;
  downloadURL: string;
  fileSize: number | null;
}

export async function uploadVideo(
  userId: string,
  sessionId: string,
  angle: VideoAngle,
  localUri: string,
  onProgress?: (progress: number) => void
): Promise<UploadVideoResult> {
  const storagePath = `videos/${userId}/${sessionId}/${angle}.mp4`;
  const storageRef = ref(storage, storagePath);

  const response = await fetch(localUri);
  const blob = await response.blob();
  const fileSize = blob.size || null;

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = snapshot.bytesTransferred / snapshot.totalBytes;
        onProgress?.(progress);
      },
      (error) => {
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ storagePath, downloadURL, fileSize });
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

/**
 * Supprime les vidéos d'une session dans Firebase Storage.
 * Ne lève pas d'erreur si un fichier n'existe pas (déjà supprimé ou jamais uploadé).
 */
export async function deleteSessionVideos(storagePaths: string[]): Promise<void> {
  const deletePromises = storagePaths.map(async (path) => {
    try {
      await deleteObject(ref(storage, path));
    } catch (err: any) {
      // Ignorer si le fichier n'existe pas
      if (err?.code === 'storage/object-not-found') return;
      throw err;
    }
  });
  await Promise.all(deletePromises);
}

/**
 * Construit un objet VideoUploadMeta complet à partir du résultat d'upload.
 */
export function buildUploadMeta(
  result: UploadVideoResult,
  angle: VideoAngle,
  duration: number
): VideoUploadMeta {
  return {
    storagePath: result.storagePath,
    downloadURL: result.downloadURL,
    fileSize: result.fileSize,
    angle,
    duration,
    uploadedAt: new Date(),
  };
}
