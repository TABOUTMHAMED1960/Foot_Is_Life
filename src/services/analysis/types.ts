import { VideoAngle } from '@/src/types/video';
import {
  AnalysisResult,
  FrontSubScores,
  BackSubScores,
  CommonSubScores,
} from '@/src/types/analysis';

export interface VideoInput {
  uri: string;
  duration: number;
  source: 'camera' | 'import';
  angle: VideoAngle;
}

export interface AnalysisInput {
  sessionId: string;
  frontVideo: VideoInput | null;
  backVideo: VideoInput | null;
}

export interface FrontAnalysisRaw {
  upperBodyAlignment: number;
  stability: number;
  torsoOpenness: number;
  gestureSymmetry: number;
  posturalQuality: number;
}

export interface BackAnalysisRaw {
  approachTrajectory: number;
  supportFootPlacement: number;
  strikingLegTrajectory: number;
  globalGestureAxis: number;
  postImpactBalance: number;
}

export interface CommonAnalysisRaw {
  approachAngle: number;
  supportFootPosition: number;
  torsoOrientation: number;
  strikingLegMovement: number;
  estimatedContactPoint: number;
  postStrikeBalance: number;
  overallTiming: number;
}

export type { AnalysisResult, FrontSubScores, BackSubScores, CommonSubScores };
