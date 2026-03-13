import { mergeScores, MergeInput } from '@/src/services/analysis/score-merger';

describe('Score Merger', () => {
  const frontRaw = {
    upperBodyAlignment: 70,
    stability: 80,
    torsoOpenness: 60,
    gestureSymmetry: 75,
    posturalQuality: 65,
  };

  const backRaw = {
    approachTrajectory: 72,
    supportFootPlacement: 68,
    strikingLegTrajectory: 74,
    globalGestureAxis: 66,
    postImpactBalance: 70,
  };

  const commonRaw = {
    approachAngle: 65,
    supportFootPosition: 70,
    torsoOrientation: 72,
    strikingLegMovement: 68,
    estimatedContactPoint: 60,
    postStrikeBalance: 75,
    overallTiming: 70,
  };

  it('merges dual-angle scores with correct confidence', () => {
    const input: MergeInput = { frontRaw, backRaw, commonRaw };
    const result = mergeScores(input);

    expect(result.confidence).toBe(1.0);
    expect(result.availableAngles).toEqual(['front', 'back']);
    expect(result.globalScore).toBeGreaterThanOrEqual(0);
    expect(result.globalScore).toBeLessThanOrEqual(100);
    expect(result.subScores.front).not.toBeNull();
    expect(result.subScores.back).not.toBeNull();
  });

  it('merges single front angle with reduced confidence', () => {
    const input: MergeInput = { frontRaw, backRaw: null, commonRaw };
    const result = mergeScores(input);

    expect(result.confidence).toBe(0.6);
    expect(result.availableAngles).toEqual(['front']);
    expect(result.subScores.back).toBeNull();
  });

  it('merges single back angle with reduced confidence', () => {
    const input: MergeInput = { frontRaw: null, backRaw, commonRaw };
    const result = mergeScores(input);

    expect(result.confidence).toBe(0.6);
    expect(result.availableAngles).toEqual(['back']);
    expect(result.subScores.front).toBeNull();
  });

  it('computes overall sub-scores as averages', () => {
    const input: MergeInput = { frontRaw, backRaw: null, commonRaw };
    const result = mergeScores(input);

    const frontOverall = result.subScores.front!.overall;
    const expectedFrontAvg = Math.round((70 + 80 + 60 + 75 + 65) / 5);
    expect(frontOverall).toBe(expectedFrontAvg);
  });

  it('global score is within valid range', () => {
    const input: MergeInput = { frontRaw, backRaw, commonRaw };
    const result = mergeScores(input);

    expect(result.globalScore).toBeGreaterThanOrEqual(0);
    expect(result.globalScore).toBeLessThanOrEqual(100);
  });
});
