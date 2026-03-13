import seedrandom from 'seedrandom';
import { VideoInput, FrontAnalysisRaw } from './types';
import {
  ScoreBaseline,
  ScoreVariance,
  MinScore,
  MaxScore,
  DurationPenalty,
} from '@/src/constants/analysis';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function analyzeFront(video: VideoInput, seed: string): FrontAnalysisRaw {
  const rng = seedrandom(seed + ':front');

  let penalty = 0;
  if (video.duration < DurationPenalty.tooShort) penalty = -DurationPenalty.penaltyAmount;
  if (video.duration > DurationPenalty.tooLong) penalty = -DurationPenalty.penaltyAmount;

  // Bonus léger pour vidéos filmées en direct (meilleure qualité attendue)
  const sourceBonus = video.source === 'camera' ? 3 : 0;

  const generate = (): number => {
    const base = ScoreBaseline + (rng() * 2 - 1) * ScoreVariance + penalty + sourceBonus;
    return clamp(Math.round(base), MinScore, MaxScore);
  };

  return {
    upperBodyAlignment: generate(),
    stability: generate(),
    torsoOpenness: generate(),
    gestureSymmetry: generate(),
    posturalQuality: generate(),
  };
}
