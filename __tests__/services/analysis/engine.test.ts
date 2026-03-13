import { AnalysisEngine } from '@/src/services/analysis/engine';
import { AnalysisInput } from '@/src/services/analysis/types';

describe('AnalysisEngine', () => {
  const engine = new AnalysisEngine();

  const dualAngleInput: AnalysisInput = {
    sessionId: 'test-session-001',
    frontVideo: { uri: 'file://front.mp4', duration: 5, source: 'camera', angle: 'front' },
    backVideo: { uri: 'file://back.mp4', duration: 6, source: 'camera', angle: 'back' },
  };

  const frontOnlyInput: AnalysisInput = {
    sessionId: 'test-session-002',
    frontVideo: { uri: 'file://front.mp4', duration: 5, source: 'camera', angle: 'front' },
    backVideo: null,
  };

  const backOnlyInput: AnalysisInput = {
    sessionId: 'test-session-003',
    frontVideo: null,
    backVideo: { uri: 'file://back.mp4', duration: 6, source: 'import', angle: 'back' },
  };

  it('produces a valid AnalysisResult with both videos', () => {
    const result = engine.analyze(dualAngleInput);

    expect(result.globalScore).toBeGreaterThanOrEqual(0);
    expect(result.globalScore).toBeLessThanOrEqual(100);
    expect(result.confidence).toBe(1.0);
    expect(result.availableAngles).toContain('front');
    expect(result.availableAngles).toContain('back');
    expect(result.subScores.front).not.toBeNull();
    expect(result.subScores.back).not.toBeNull();
    expect(result.subScores.common).toBeDefined();
    expect(result.strengths.length).toBeLessThanOrEqual(3);
    expect(result.defects.length).toBeLessThanOrEqual(3);
    expect(result.tips.length).toBeGreaterThan(0);
    expect(result.disclaimer).toBeTruthy();
    expect(result.analyzedAt).toBeInstanceOf(Date);
  });

  it('produces a valid result with only front video', () => {
    const result = engine.analyze(frontOnlyInput);

    expect(result.globalScore).toBeGreaterThanOrEqual(0);
    expect(result.globalScore).toBeLessThanOrEqual(100);
    expect(result.confidence).toBe(0.6);
    expect(result.availableAngles).toContain('front');
    expect(result.availableAngles).not.toContain('back');
    expect(result.subScores.front).not.toBeNull();
    expect(result.subScores.back).toBeNull();
  });

  it('produces a valid result with only back video', () => {
    const result = engine.analyze(backOnlyInput);

    expect(result.confidence).toBe(0.6);
    expect(result.availableAngles).toContain('back');
    expect(result.availableAngles).not.toContain('front');
    expect(result.subScores.front).toBeNull();
    expect(result.subScores.back).not.toBeNull();
  });

  it('produces deterministic scores for the same session', () => {
    const result1 = engine.analyze(dualAngleInput);
    const result2 = engine.analyze(dualAngleInput);

    expect(result1.globalScore).toBe(result2.globalScore);
    expect(result1.subScores.front?.stability).toBe(result2.subScores.front?.stability);
    expect(result1.subScores.back?.approachTrajectory).toBe(result2.subScores.back?.approachTrajectory);
    expect(result1.subScores.common.overallTiming).toBe(result2.subScores.common.overallTiming);
  });

  it('produces different scores for different sessions', () => {
    const result1 = engine.analyze(dualAngleInput);
    const differentInput = { ...dualAngleInput, sessionId: 'different-session' };
    const result2 = engine.analyze(differentInput);

    // Très improbable que tous les scores soient identiques avec un seed différent
    const allSame =
      result1.globalScore === result2.globalScore &&
      result1.subScores.common.approachAngle === result2.subScores.common.approachAngle;
    expect(allSame).toBe(false);
  });

  it('includes defects with severity and exercises', () => {
    const result = engine.analyze(dualAngleInput);

    for (const defect of result.defects) {
      expect(['léger', 'moyen', 'important']).toContain(defect.severity);
      expect(defect.label).toBeTruthy();
      expect(defect.exercises.length).toBeLessThanOrEqual(2);
    }
  });
});
