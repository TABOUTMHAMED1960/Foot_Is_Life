import seedrandom from 'seedrandom';
import { VideoInput, BackAnalysisRaw } from './types';
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

export function analyzeBack(video: VideoInput, seed: string): BackAnalysisRaw {
  const rng = seedrandom(seed + ':back');

  let penalty = 0;
  if (video.duration < DurationPenalty.tooShort) penalty = -DurationPenalty.penaltyAmount;
  if (video.duration > DurationPenalty.tooLong) penalty = -DurationPenalty.penaltyAmount;

  const sourceBonus = video.source === 'camera' ? 3 : 0;

  const generate = (): number => {
    const base = ScoreBaseline + (rng() * 2 - 1) * ScoreVariance + penalty + sourceBonus;
    return clamp(Math.round(base), MinScore, MaxScore);
  };

  return {
    approachTrajectory: generate(),
    supportFootPlacement: generate(),
    strikingLegTrajectory: generate(),
    globalGestureAxis: generate(),
    postImpactBalance: generate(),
  };
}
