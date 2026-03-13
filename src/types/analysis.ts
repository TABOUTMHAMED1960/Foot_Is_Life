import { VideoAngle } from './video';

export type Severity = 'léger' | 'moyen' | 'important';

export interface FrontSubScores {
  upperBodyAlignment: number;
  stability: number;
  torsoOpenness: number;
  gestureSymmetry: number;
  posturalQuality: number;
  overall: number;
}

export interface BackSubScores {
  approachTrajectory: number;
  supportFootPlacement: number;
  strikingLegTrajectory: number;
  globalGestureAxis: number;
  postImpactBalance: number;
  overall: number;
}

export interface CommonSubScores {
  approachAngle: number;
  supportFootPosition: number;
  torsoOrientation: number;
  strikingLegMovement: number;
  estimatedContactPoint: number;
  postStrikeBalance: number;
  overallTiming: number;
  overall: number;
}

export interface Defect {
  label: string;
  severity: Severity;
  exercises: string[];
}

export interface AnalysisSubScores {
  front: FrontSubScores | null;
  back: BackSubScores | null;
  common: CommonSubScores;
}

export interface AnalysisResult {
  globalScore: number;
  confidence: number;
  availableAngles: VideoAngle[];
  subScores: AnalysisSubScores;
  strengths: string[];
  defects: Defect[];
  tips: string[];
  disclaimer: string;
  analyzedAt: Date;
}
