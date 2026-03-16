import { AnalysisResult } from '@/src/types/analysis';
import { Strings } from '@/src/constants/strings.fr';

/**
 * Tests pour le contrat de données utilisé par ShareCard.
 * On vérifie que les données entrantes sont correctement
 * traitées (limites, fallbacks) selon la même logique
 * que le composant ShareCard.
 */

function prepareShareCardData(analysis: {
  globalScore: number;
  strengths: string[];
  defects: { label: string }[];
}) {
  return {
    score: Math.round(analysis.globalScore),
    strengths: analysis.strengths.slice(0, 3),
    defects: analysis.defects.map((d) => d.label).slice(0, 3),
    title: Strings.results.shareTitle,
    footer: Strings.results.shareFooter,
  };
}

describe('ShareCard data preparation', () => {
  it('arrondit le score et limite les listes', () => {
    const data = prepareShareCardData({
      globalScore: 72.8,
      strengths: ['A', 'B', 'C', 'D'],
      defects: [{ label: '1' }, { label: '2' }, { label: '3' }, { label: '4' }],
    });

    expect(data.score).toBe(73);
    expect(data.strengths).toEqual(['A', 'B', 'C']);
    expect(data.defects).toEqual(['1', '2', '3']);
  });

  it('gère un score de 0 et des listes vides', () => {
    const data = prepareShareCardData({
      globalScore: 0,
      strengths: [],
      defects: [],
    });

    expect(data.score).toBe(0);
    expect(data.strengths).toEqual([]);
    expect(data.defects).toEqual([]);
  });

  it('contient le branding correct', () => {
    const data = prepareShareCardData({
      globalScore: 50,
      strengths: [],
      defects: [],
    });

    expect(data.title).toBe('Mon analyse Foot Is Life');
    expect(data.footer).toBe('Analysé avec Foot Is Life');
  });

  it('gère un score parfait avec beaucoup de forces', () => {
    const data = prepareShareCardData({
      globalScore: 100,
      strengths: ['Parfait', 'Incroyable', 'Top', 'Extra', 'Super'],
      defects: [],
    });

    expect(data.score).toBe(100);
    expect(data.strengths.length).toBe(3);
    expect(data.defects.length).toBe(0);
  });
});
