import { generateStrengths, generateDefects, generateTips } from '@/src/services/analysis/tips-generator';
import { MergeResult } from '@/src/services/analysis/score-merger';

describe('Tips Generator', () => {
  const highScoreResult: MergeResult = {
    globalScore: 82,
    confidence: 1.0,
    availableAngles: ['front', 'back'],
    subScores: {
      front: {
        upperBodyAlignment: 85,
        stability: 90,
        torsoOpenness: 78,
        gestureSymmetry: 82,
        posturalQuality: 75,
        overall: 82,
      },
      back: {
        approachTrajectory: 80,
        supportFootPlacement: 88,
        strikingLegTrajectory: 76,
        globalGestureAxis: 72,
        postImpactBalance: 84,
        overall: 80,
      },
      common: {
        approachAngle: 78,
        supportFootPosition: 82,
        torsoOrientation: 80,
        strikingLegMovement: 74,
        estimatedContactPoint: 70,
        postStrikeBalance: 86,
        overallTiming: 79,
        overall: 78,
      },
    },
  };

  const lowScoreResult: MergeResult = {
    globalScore: 42,
    confidence: 0.6,
    availableAngles: ['front'],
    subScores: {
      front: {
        upperBodyAlignment: 35,
        stability: 40,
        torsoOpenness: 30,
        gestureSymmetry: 45,
        posturalQuality: 38,
        overall: 38,
      },
      back: null,
      common: {
        approachAngle: 42,
        supportFootPosition: 48,
        torsoOrientation: 50,
        strikingLegMovement: 44,
        estimatedContactPoint: 35,
        postStrikeBalance: 40,
        overallTiming: 46,
        overall: 44,
      },
    },
  };

  describe('generateStrengths', () => {
    it('returns max 3 strengths', () => {
      const strengths = generateStrengths(highScoreResult);
      expect(strengths.length).toBeLessThanOrEqual(3);
    });

    it('returns strengths as French strings', () => {
      const strengths = generateStrengths(highScoreResult);
      for (const s of strengths) {
        expect(typeof s).toBe('string');
        expect(s.length).toBeGreaterThan(0);
      }
    });
  });

  describe('generateDefects', () => {
    it('returns max 3 defects', () => {
      const defects = generateDefects(lowScoreResult);
      expect(defects.length).toBeLessThanOrEqual(3);
    });

    it('returns defects with severity and exercises', () => {
      const defects = generateDefects(lowScoreResult);
      for (const d of defects) {
        expect(['léger', 'moyen', 'important']).toContain(d.severity);
        expect(d.label).toBeTruthy();
        expect(Array.isArray(d.exercises)).toBe(true);
        expect(d.exercises.length).toBeLessThanOrEqual(2);
      }
    });

    it('returns fewer defects for high scores', () => {
      const defects = generateDefects(highScoreResult);
      expect(defects.length).toBe(0);
    });
  });

  describe('generateTips', () => {
    it('returns at least one tip', () => {
      const tips = generateTips(highScoreResult);
      expect(tips.length).toBeGreaterThan(0);
    });

    it('includes single-angle warning when confidence < 1', () => {
      const tips = generateTips(lowScoreResult);
      const hasAngleWarning = tips.some((t) => t.includes('deux angles'));
      expect(hasAngleWarning).toBe(true);
    });

    it('tips are in French', () => {
      const tips = generateTips(lowScoreResult);
      for (const t of tips) {
        expect(typeof t).toBe('string');
        expect(t.length).toBeGreaterThan(10);
      }
    });
  });
});
