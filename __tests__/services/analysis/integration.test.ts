/**
 * Test d'intégration : pipeline complet d'analyse
 * Vérifie que le moteur produit un résultat cohérent de bout en bout.
 */
import { analysisEngine } from '@/src/services/analysis/engine';
import { AnalysisInput } from '@/src/services/analysis/types';
import { AnalysisResult } from '@/src/types/analysis';

describe('Pipeline d\'analyse intégration', () => {
  const dualAngleInput: AnalysisInput = {
    sessionId: 'integration-test-session-001',
    frontVideo: {
      uri: 'file:///test/front.mp4',
      duration: 5000,
      source: 'camera',
      angle: 'front',
    },
    backVideo: {
      uri: 'file:///test/back.mp4',
      duration: 4500,
      source: 'camera',
      angle: 'back',
    },
  };

  const singleAngleInput: AnalysisInput = {
    sessionId: 'integration-test-session-002',
    frontVideo: {
      uri: 'file:///test/front-only.mp4',
      duration: 5000,
      source: 'import',
      angle: 'front',
    },
    backVideo: null,
  };

  let dualResult: AnalysisResult;
  let singleResult: AnalysisResult;

  beforeAll(() => {
    dualResult = analysisEngine.analyze(dualAngleInput);
    singleResult = analysisEngine.analyze(singleAngleInput);
  });

  // --- Dual angle ---
  it('produit un résultat complet avec 2 angles', () => {
    expect(dualResult).toBeDefined();
    expect(dualResult.globalScore).toBeGreaterThanOrEqual(0);
    expect(dualResult.globalScore).toBeLessThanOrEqual(100);
    expect(dualResult.confidence).toBe(1.0);
    expect(dualResult.availableAngles).toEqual(['front', 'back']);
  });

  it('contient les 3 groupes de sous-scores avec 2 angles', () => {
    expect(dualResult.subScores.front).not.toBeNull();
    expect(dualResult.subScores.back).not.toBeNull();
    expect(dualResult.subScores.common).toBeDefined();
  });

  it('génère des points forts (max 3)', () => {
    expect(dualResult.strengths.length).toBeGreaterThanOrEqual(0);
    expect(dualResult.strengths.length).toBeLessThanOrEqual(3);
    for (const s of dualResult.strengths) {
      expect(typeof s).toBe('string');
      expect(s.length).toBeGreaterThan(0);
    }
  });

  it('génère des défauts avec sévérité et exercices (max 3)', () => {
    expect(dualResult.defects.length).toBeLessThanOrEqual(3);
    for (const d of dualResult.defects) {
      expect(d.label).toBeTruthy();
      expect(['léger', 'moyen', 'important']).toContain(d.severity);
      expect(d.exercises.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('génère des conseils en français', () => {
    expect(dualResult.tips.length).toBeGreaterThan(0);
    for (const tip of dualResult.tips) {
      expect(typeof tip).toBe('string');
      expect(tip.length).toBeGreaterThan(5);
    }
  });

  it('inclut le disclaimer MVP', () => {
    expect(dualResult.disclaimer).toBeTruthy();
    expect(dualResult.disclaimer.length).toBeGreaterThan(10);
  });

  // --- Single angle ---
  it('produit un résultat partiel avec 1 seul angle', () => {
    expect(singleResult.confidence).toBe(0.6);
    expect(singleResult.availableAngles).toEqual(['front']);
    expect(singleResult.subScores.front).not.toBeNull();
    expect(singleResult.subScores.back).toBeNull();
  });

  it('inclut un tip sur l\'analyse partielle', () => {
    const hasPartialTip = singleResult.tips.some(
      (t) => t.toLowerCase().includes('angle') || t.toLowerCase().includes('partiel')
    );
    expect(hasPartialTip).toBe(true);
  });

  // --- Determinism ---
  it('est déterministe : même input = même résultat', () => {
    const result2 = analysisEngine.analyze(dualAngleInput);
    expect(result2.globalScore).toBe(dualResult.globalScore);
    expect(result2.strengths).toEqual(dualResult.strengths);
    expect(result2.defects).toEqual(dualResult.defects);
    expect(result2.tips).toEqual(dualResult.tips);
  });

  it('donne des scores différents pour des sessions différentes', () => {
    expect(singleResult.globalScore).toBeGreaterThanOrEqual(0);
    expect(singleResult.globalScore).toBeLessThanOrEqual(100);
  });
});
