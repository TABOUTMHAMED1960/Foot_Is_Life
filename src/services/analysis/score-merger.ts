import {
  FrontAnalysisRaw,
  BackAnalysisRaw,
  CommonAnalysisRaw,
  FrontSubScores,
  BackSubScores,
  CommonSubScores,
} from './types';
import { VideoAngle } from '@/src/types/video';
import {
  AnalysisWeights,
  SingleAngleWeights,
  ConfidenceLevels,
  MinScore,
  MaxScore,
} from '@/src/constants/analysis';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function computeFrontSubScores(raw: FrontAnalysisRaw): FrontSubScores {
  const values = Object.values(raw);
  return {
    ...raw,
    overall: Math.round(average(values)),
  };
}

export function computeBackSubScores(raw: BackAnalysisRaw): BackSubScores {
  const values = Object.values(raw);
  return {
    ...raw,
    overall: Math.round(average(values)),
  };
}

export function computeCommonSubScores(raw: CommonAnalysisRaw): CommonSubScores {
  const values = Object.values(raw);
  return {
    ...raw,
    overall: Math.round(average(values)),
  };
}

export interface MergeInput {
  frontRaw: FrontAnalysisRaw | null;
  backRaw: BackAnalysisRaw | null;
  commonRaw: CommonAnalysisRaw;
}

export interface MergeResult {
  globalScore: number;
  confidence: number;
  availableAngles: VideoAngle[];
  subScores: {
    front: FrontSubScores | null;
    back: BackSubScores | null;
    common: CommonSubScores;
  };
}

export function mergeScores(input: MergeInput): MergeResult {
  const { frontRaw, backRaw, commonRaw } = input;

  const hasFront = frontRaw !== null;
  const hasBack = backRaw !== null;
  const hasBoth = hasFront && hasBack;

  const frontScores = frontRaw ? computeFrontSubScores(frontRaw) : null;
  const backScores = backRaw ? computeBackSubScores(backRaw) : null;
  const commonScores = computeCommonSubScores(commonRaw);

  const availableAngles: VideoAngle[] = [];
  if (hasFront) availableAngles.push('front');
  if (hasBack) availableAngles.push('back');

  let globalScore: number;

  if (hasBoth) {
    globalScore =
      commonScores.overall * AnalysisWeights.common +
      frontScores!.overall * AnalysisWeights.front +
      backScores!.overall * AnalysisWeights.back;
  } else if (hasFront) {
    globalScore =
      commonScores.overall * SingleAngleWeights.common +
      frontScores!.overall * SingleAngleWeights.available;
  } else if (hasBack) {
    globalScore =
      commonScores.overall * SingleAngleWeights.common +
      backScores!.overall * SingleAngleWeights.available;
  } else {
    globalScore = commonScores.overall;
  }

  globalScore = clamp(Math.round(globalScore), MinScore, MaxScore);

  const confidence = hasBoth
    ? ConfidenceLevels.dualAngle
    : ConfidenceLevels.singleAngle;

  return {
    globalScore,
    confidence,
    availableAngles,
    subScores: {
      front: frontScores,
      back: backScores,
      common: commonScores,
    },
  };
}
