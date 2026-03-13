import { buildShareText } from '@/src/utils/formatters';

describe('buildShareText', () => {
  it('génère un texte complet avec score, forces et défauts', () => {
    const text = buildShareText({
      globalScore: 74,
      strengths: ['Bonne stabilité', 'Buste ouvert'],
      defects: [
        { label: 'Pied d\'appui mal placé' },
        { label: 'Timing décalé' },
      ],
    });

    expect(text).toContain('Mon analyse Foot Is Life');
    expect(text).toContain('Score global : 74 / 100');
    expect(text).toContain('Points forts :');
    expect(text).toContain('  + Bonne stabilité');
    expect(text).toContain('  + Buste ouvert');
    expect(text).toContain('À améliorer :');
    expect(text).toContain("  - Pied d'appui mal placé");
    expect(text).toContain('  - Timing décalé');
    expect(text).toContain('La progression passe par la répétition !');
    expect(text).toContain('Analysé avec Foot Is Life');
  });

  it('arrondit le score', () => {
    const text = buildShareText({
      globalScore: 72.7,
      strengths: [],
      defects: [],
    });

    expect(text).toContain('Score global : 73 / 100');
  });

  it('omet la section points forts si vide', () => {
    const text = buildShareText({
      globalScore: 50,
      strengths: [],
      defects: [{ label: 'Buste fermé' }],
    });

    expect(text).not.toContain('Points forts');
    expect(text).toContain('À améliorer :');
  });

  it('omet la section défauts si vide', () => {
    const text = buildShareText({
      globalScore: 90,
      strengths: ['Stabilité parfaite'],
      defects: [],
    });

    expect(text).toContain('Points forts :');
    expect(text).not.toContain('À améliorer');
  });

  it('limite à 3 points forts et 3 défauts', () => {
    const text = buildShareText({
      globalScore: 60,
      strengths: ['A', 'B', 'C', 'D', 'E'],
      defects: [
        { label: '1' },
        { label: '2' },
        { label: '3' },
        { label: '4' },
      ],
    });

    expect(text).toContain('  + A');
    expect(text).toContain('  + B');
    expect(text).toContain('  + C');
    expect(text).not.toContain('  + D');
    expect(text).toContain('  - 1');
    expect(text).toContain('  - 2');
    expect(text).toContain('  - 3');
    expect(text).not.toContain('  - 4');
  });

  it('fonctionne avec un score de 0 et aucune donnée', () => {
    const text = buildShareText({
      globalScore: 0,
      strengths: [],
      defects: [],
    });

    expect(text).toContain('Score global : 0 / 100');
    expect(text).toContain('Analysé avec Foot Is Life');
  });
});
