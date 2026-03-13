export type VideoAngle = 'front' | 'back';
export type VideoSource = 'camera' | 'import';

export interface VideoUploadMeta {
  storagePath: string;
  downloadURL: string;
  fileSize: number | null;
  angle: VideoAngle;
  duration: number;
  uploadedAt: Date;
}

export interface VideoData {
  uri: string;
  localUri?: string;
  duration: number;
  source: VideoSource;
  angle: VideoAngle;
  uploadedAt?: Date;
  uploadMeta?: VideoUploadMeta;
}
