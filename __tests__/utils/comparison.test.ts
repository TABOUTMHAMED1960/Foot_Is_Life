import { compareAnalyses, ComparisonResult } from '@/src/utils/comparison';
import { AnalysisResult } from '@/src/types/analysis';
import { Strings } from '@/src/constants/strings.fr';

function makeAnalysis(overrides?: Partial<AnalysisResult>): AnalysisResult {
  return {
    globalScore: 65,
    confidence: 1.0,
    availableAngles: ['front', 'back'],
    subScores: {
      front: {
        upperBodyAlignment: 60,
        stability: 65,
        torsoOpenness: 62,
        gestureSymmetry: 68,
        posturalQuality: 66,
        overall: 64,
      },
      back: {
        approachTrajectory: 63,
        supportFootPlacement: 67,
        strikingLegTrajectory: 61,
        globalGestureAxis: 64,
        postImpactBalance: 66,
        overall: 64,
      },
      common: {
        approachAngle: 62,
        supportFootPosition: 65,
        torsoOrientation: 60,
        strikingLegMovement: 68,
        estimatedContactPoint: 63,
        postStrikeBalance: 67,
        overallTiming: 64,
        overall: 64,
      },
    },
    strengths: ['Bonne stabilité', 'Buste ouvert'],
    defects: [
      { label: 'Pied d\'appui mal placé', severity: 'moyen', exercises: [] },
      { label: 'Timing décalé', severity: 'léger', exercises: [] },
    ],
    tips: [],
    disclaimer: 'Test',
    analyzedAt: new Date('2026-03-10'),
    ...overrides,
  };
}

describe('compareAnalyses', () => {
  it('détecte une progression quand le score augmente', () => {
    const before = makeAnalysis({ globalScore: 60 });
    const after = makeAnalysis({ globalScore: 75 });

    const result = compareAnalyses(before, after);

    expect(result.globalScore.before).toBe(60);
    expect(result.globalScore.after).toBe(75);
    expect(result.globalScore.delta).toBe(15);
    expect(result.globalScore.trend).toBe('up');
    expect(result.overallTrend).toBe('up');
    expect(result.overallTrendLabel).toBe(Strings.compare.trendUp);
  });

  it('détecte un recul quand le score baisse', () => {
    const before = makeAnalysis({ globalScore: 80 });
    const after = makeAnalysis({ globalScore: 65 });

    const result = compareAnalyses(before, after);

    expect(result.globalScore.delta).toBe(-15);
    expect(result.overallTrend).toBe('down');
    expect(result.overallTrendLabel).toBe(Strings.compare.trendDown);
  });

  it('détecte une stabilité quand le score ne bouge pas significativement', () => {
    const before = makeAnalysis({ globalScore: 70 });
    const after = makeAnalysis({ globalScore: 71 });

    const result = compareAnalyses(before, after);

    expect(result.overallTrend).toBe('stable');
    expect(result.overallTrendLabel).toBe(Strings.compare.trendStable);
  });

  it('compare les sous-scores communs', () => {
    const before = makeAnalysis();
    const after = makeAnalysis();
    after.subScores.common.approachAngle = 80;

    const result = compareAnalyses(before, after);

    const approach = result.commonScores.find(
      (s) => s.label === Strings.scores.approachAngle
    );
    expect(approach).toBeDefined();
    expect(approach!.before).toBe(62);
    expect(approach!.after).toBe(80);
    expect(approach!.delta).toBe(18);
    expect(approach!.trend).toBe('up');
  });

  it('compare les sous-scores face quand les deux ont des données', () => {
    const before = makeAnalysis();
    const after = makeAnalysis();

    const result = compareAnalyses(before, after);

    expect(result.frontScores.length).toBe(5);
    expect(result.frontScores[0].label).toBe(Strings.scores.upperBodyAlignment);
  });

  it('retourne un tableau vide pour front si une séance n\'a pas de vue de face', () => {
    const before = makeAnalysis();
    const after = makeAnalysis();
    after.subScores.front = null;

    const result = compareAnalyses(before, after);

    expect(result.frontScores).toEqual([]);
  });

  it('identifie les nouveaux points forts', () => {
    const before = makeAnalysis({ strengths: ['Bonne stabilité'] });
    const after = makeAnalysis({ strengths: ['Bonne stabilité', 'Timing fluide'] });

    const result = compareAnalyses(before, after);

    expect(result.strengthsGained).toEqual(['Timing fluide']);
    expect(result.strengthsLost).toEqual([]);
  });

  it('identifie les défauts corrigés', () => {
    const before = makeAnalysis({
      defects: [
        { label: 'Buste fermé', severity: 'moyen', exercises: [] },
        { label: 'Timing décalé', severity: 'léger', exercises: [] },
      ],
    });
    const after = makeAnalysis({
      defects: [
        { label: 'Timing décalé', severity: 'léger', exercises: [] },
      ],
    });

    const result = compareAnalyses(before, after);

    expect(result.defectsFixed).toEqual(['Buste fermé']);
    expect(result.defectsNew).toEqual([]);
  });

  it('identifie les nouveaux défauts', () => {
    const before = makeAnalysis({ defects: [] });
    const after = makeAnalysis({
      defects: [{ label: 'Pied mal placé', severity: 'moyen', exercises: [] }],
    });

    const result = compareAnalyses(before, after);

    expect(result.defectsNew).toEqual(['Pied mal placé']);
  });

  it('limite les listes à 3 éléments max', () => {
    const before = makeAnalysis({
      strengths: [],
      defects: [
        { label: 'A', severity: 'léger', exercises: [] },
        { label: 'B', severity: 'léger', exercises: [] },
        { label: 'C', severity: 'léger', exercises: [] },
        { label: 'D', severity: 'léger', exercises: [] },
        { label: 'E', severity: 'léger', exercises: [] },
      ],
    });
    const after = makeAnalysis({
      strengths: ['A', 'B', 'C', 'D'],
      defects: [],
    });

    const result = compareAnalyses(before, after);

    expect(result.strengthsGained.length).toBeLessThanOrEqual(3);
    expect(result.defectsFixed.length).toBeLessThanOrEqual(3);
  });
});
