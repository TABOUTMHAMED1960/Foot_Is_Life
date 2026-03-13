import { AnalysisResult } from '@/src/types/analysis';
import { Strings } from '@/src/constants/strings.fr';

export type Trend = 'up' | 'down' | 'stable';

export interface ScoreDelta {
  label: string;
  before: number;
  after: number;
  delta: number;
  trend: Trend;
}

export interface ComparisonResult {
  globalScore: ScoreDelta;
  commonScores: ScoreDelta[];
  frontScores: ScoreDelta[];
  backScores: ScoreDelta[];
  strengthsGained: string[];
  strengthsLost: string[];
  defectsFixed: string[];
  defectsNew: string[];
  overallTrend: Trend;
  overallTrendLabel: string;
}

function getTrend(delta: number): Trend {
  if (delta > 2) return 'up';
  if (delta < -2) return 'down';
  return 'stable';
}

function buildDelta(label: string, before: number, after: number): ScoreDelta {
  const delta = after - before;
  return { label, before, after, delta, trend: getTrend(delta) };
}

export function compareAnalyses(
  before: AnalysisResult,
  after: AnalysisResult
): ComparisonResult {
  const globalScore = buildDelta(
    Strings.results.globalScore,
    before.globalScore,
    after.globalScore
  );

  // Sous-scores communs
  const commonKeys: Array<{ key: keyof typeof before.subScores.common; label: string }> = [
    { key: 'approachAngle', label: Strings.scores.approachAngle },
    { key: 'supportFootPosition', label: Strings.scores.supportFootPosition },
    { key: 'torsoOrientation', label: Strings.scores.torsoOrientation },
    { key: 'strikingLegMovement', label: Strings.scores.strikingLegMovement },
    { key: 'estimatedContactPoint', label: Strings.scores.estimatedContactPoint },
    { key: 'postStrikeBalance', label: Strings.scores.postStrikeBalance },
    { key: 'overallTiming', label: Strings.scores.overallTiming },
  ];

  const commonScores = commonKeys.map(({ key, label }) =>
    buildDelta(label, before.subScores.common[key], after.subScores.common[key])
  );

  // Sous-scores face
  let frontScores: ScoreDelta[] = [];
  if (before.subScores.front && after.subScores.front) {
    const frontKeys: Array<{ key: keyof NonNullable<typeof before.subScores.front>; label: string }> = [
      { key: 'upperBodyAlignment', label: Strings.scores.upperBodyAlignment },
      { key: 'stability', label: Strings.scores.stability },
      { key: 'torsoOpenness', label: Strings.scores.torsoOpenness },
      { key: 'gestureSymmetry', label: Strings.scores.gestureSymmetry },
      { key: 'posturalQuality', label: Strings.scores.posturalQuality },
    ];
    frontScores = frontKeys.map(({ key, label }) =>
      buildDelta(label, before.subScores.front![key], after.subScores.front![key])
    );
  }

  // Sous-scores dos
  let backScores: ScoreDelta[] = [];
  if (before.subScores.back && after.subScores.back) {
    const backKeys: Array<{ key: keyof NonNullable<typeof before.subScores.back>; label: string }> = [
      { key: 'approachTrajectory', label: Strings.scores.approachTrajectory },
      { key: 'supportFootPlacement', label: Strings.scores.supportFootPlacement },
      { key: 'strikingLegTrajectory', label: Strings.scores.strikingLegTrajectory },
      { key: 'globalGestureAxis', label: Strings.scores.globalGestureAxis },
      { key: 'postImpactBalance', label: Strings.scores.postImpactBalance },
    ];
    backScores = backKeys.map(({ key, label }) =>
      buildDelta(label, before.subScores.back![key], after.subScores.back![key])
    );
  }

  // Points forts
  const beforeStrengths = new Set(before.strengths);
  const afterStrengths = new Set(after.strengths);
  const strengthsGained = after.strengths.filter((s) => !beforeStrengths.has(s)).slice(0, 3);
  const strengthsLost = before.strengths.filter((s) => !afterStrengths.has(s)).slice(0, 3);

  // Défauts
  const beforeDefects = new Set(before.defects.map((d) => d.label));
  const afterDefects = new Set(after.defects.map((d) => d.label));
  const defectsFixed = before.defects
    .map((d) => d.label)
    .filter((l) => !afterDefects.has(l))
    .slice(0, 3);
  const defectsNew = after.defects
    .map((d) => d.label)
    .filter((l) => !beforeDefects.has(l))
    .slice(0, 3);

  // Tendance globale
  const overallTrend = getTrend(globalScore.delta);
  let overallTrendLabel: string;
  if (overallTrend === 'up') {
    overallTrendLabel = Strings.compare.trendUp;
  } else if (overallTrend === 'down') {
    overallTrendLabel = Strings.compare.trendDown;
  } else {
    overallTrendLabel = Strings.compare.trendStable;
  }

  return {
    globalScore,
    commonScores,
    frontScores,
    backScores,
    strengthsGained,
    strengthsLost,
    defectsFixed,
    defectsNew,
    overallTrend,
    overallTrendLabel,
  };
}
