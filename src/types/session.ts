import { AnalysisResult } from './analysis';
import { VideoData } from './video';

export type SessionStatus = 'recording' | 'validating' | 'analyzing' | 'completed' | 'error';

export interface SessionVideos {
  front: VideoData | null;
  back: VideoData | null;
}

export interface Session {
  id: string;
  userId: string;
  createdAt: Date;
  status: SessionStatus;
  videos: SessionVideos;
  analysis: AnalysisResult | null;
}
