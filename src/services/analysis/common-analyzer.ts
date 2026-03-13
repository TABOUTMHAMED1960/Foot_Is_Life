import seedrandom from 'seedrandom';
import { AnalysisInput, CommonAnalysisRaw } from './types';
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

function durationPenalty(duration: number): number {
  if (duration < DurationPenalty.tooShort) return -DurationPenalty.penaltyAmount;
  if (duration > DurationPenalty.tooLong) return -DurationPenalty.penaltyAmount;
  return 0;
}

export function analyzeCommon(input: AnalysisInput, seed: string): CommonAnalysisRaw {
  const rng = seedrandom(seed + ':common');

  const avgDuration = getAverageDuration(input);
  const penalty = durationPenalty(avgDuration);

  const generate = (): number => {
    const base = ScoreBaseline + (rng() * 2 - 1) * ScoreVariance + penalty;
    return clamp(Math.round(base), MinScore, MaxScore);
  };

  return {
    approachAngle: generate(),
    supportFootPosition: generate(),
    torsoOrientation: generate(),
    strikingLegMovement: generate(),
    estimatedContactPoint: generate(),
    postStrikeBalance: generate(),
    overallTiming: generate(),
  };
}

function getAverageDuration(input: AnalysisInput): number {
  const durations: number[] = [];
  if (input.frontVideo) durations.push(input.frontVideo.duration);
  if (input.backVideo) durations.push(input.backVideo.duration);
  if (durations.length === 0) return 5;
  return durations.reduce((a, b) => a + b, 0) / durations.length;
}
