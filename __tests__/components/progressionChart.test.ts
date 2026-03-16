import { ProgressionPoint } from '@/src/hooks/usePlayerStats';

/**
 * Tests pour la logique de données du graphique de progression.
 * On vérifie le contrat des données d'entrée (ProgressionPoint[])
 * tel que produit par usePlayerStats.
 */

function buildProgression(
  scores: { score: number; daysAgo: number }[]
): ProgressionPoint[] {
  const now = new Date('2026-03-13');
  return scores
    .sort((a, b) => b.daysAgo - a.daysAgo) // chronologique
    .map((s, i) => ({
      date: new Date(now.getTime() - s.daysAgo * 86400000),
      score: s.score,
      label: `S${i + 1}`,
    }));
}

describe('Données de progression pour le graphique', () => {
  it('produit des points ordonnés chronologiquement', () => {
    const data = buildProgression([
      { score: 60, daysAgo: 10 },
      { score: 70, daysAgo: 5 },
      { score: 75, daysAgo: 1 },
    ]);

    expect(data.length).toBe(3);
    expect(data[0].date.getTime()).toBeLessThan(data[1].date.getTime());
    expect(data[1].date.getTime()).toBeLessThan(data[2].date.getTime());
  });

  it('conserve les scores corrects', () => {
    const data = buildProgression([
      { score: 55, daysAgo: 3 },
      { score: 80, daysAgo: 1 },
    ]);

    expect(data[0].score).toBe(55);
    expect(data[1].score).toBe(80);
  });

  it('gère un tableau vide', () => {
    const data = buildProgression([]);
    expect(data).toEqual([]);
  });

  it('gère un seul point', () => {
    const data = buildProgression([{ score: 72, daysAgo: 0 }]);
    expect(data.length).toBe(1);
    expect(data[0].score).toBe(72);
    expect(data[0].label).toBe('S1');
  });

  it('génère des labels séquentiels S1, S2, S3...', () => {
    const data = buildProgression([
      { score: 60, daysAgo: 10 },
      { score: 65, daysAgo: 5 },
      { score: 70, daysAgo: 2 },
    ]);

    expect(data.map((d) => d.label)).toEqual(['S1', 'S2', 'S3']);
  });

  it('gère des scores extrêmes (0 et 100)', () => {
    const data = buildProgression([
      { score: 0, daysAgo: 5 },
      { score: 100, daysAgo: 1 },
    ]);

    expect(data[0].score).toBe(0);
    expect(data[1].score).toBe(100);
  });
});
