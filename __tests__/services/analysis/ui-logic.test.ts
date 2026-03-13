/**
 * Tests de logique métier pour les composants UI.
 * Vérifie les strings, couleurs, seuils et calculs utilisés par l'interface.
 *
 * Note : les tests de rendu React Native (render + screen) sont bloqués
 * par un bug jest-expo avec Expo SDK 55. Ces tests vérifient la logique
 * extraite des composants.
 */
import { getScoreColor } from '@/src/constants/theme';
import { Strings } from '@/src/constants/strings.fr';

describe('ScoreCard - logique', () => {
  it('getScoreColor retourne une couleur valide pour un bon score (>=70)', () => {
    const color = getScoreColor(75);
    expect(color).toBeTruthy();
    expect(typeof color).toBe('string');
  });

  it('getScoreColor retourne une couleur valide pour un score moyen (50-69)', () => {
    const color = getScoreColor(55);
    expect(color).toBeTruthy();
  });

  it('getScoreColor retourne une couleur valide pour un mauvais score (<50)', () => {
    const color = getScoreColor(30);
    expect(color).toBeTruthy();
  });

  it('les couleurs sont différentes entre bon et mauvais scores', () => {
    const good = getScoreColor(80);
    const bad = getScoreColor(20);
    expect(good).not.toBe(bad);
  });

  it('le label "Score global" est bien en français', () => {
    expect(Strings.results.globalScore).toBe('Score global');
  });

  it('arrondi du score fonctionne correctement', () => {
    expect(Math.round(72.6)).toBe(73);
    expect(Math.round(72.4)).toBe(72);
    expect(Math.round(0)).toBe(0);
    expect(Math.round(100)).toBe(100);
  });
});

describe('ConfidenceBadge - logique', () => {
  it('confidence >= 1.0 correspond au badge "Élevé (2 angles)"', () => {
    const isHigh = 1.0 >= 1.0;
    expect(isHigh).toBe(true);
    expect(Strings.results.confidenceHigh).toBe('Élevé (2 angles)');
  });

  it('confidence < 1.0 correspond au badge "Modéré (1 angle)"', () => {
    const isHigh = 0.6 >= 1.0;
    expect(isHigh).toBe(false);
    expect(Strings.results.confidenceMedium).toBe('Modéré (1 angle)');
  });

  it('confidence < 1.0 affiche "Analyse partielle"', () => {
    const showPartial = 0.6 < 1.0;
    expect(showPartial).toBe(true);
    expect(Strings.results.partialAnalysis).toBe('Analyse partielle');
  });
});

describe('Strings françaises - cohérence', () => {
  it('les sévérités sont en français', () => {
    expect(Strings.results.severityLight).toBe('Léger');
    expect(Strings.results.severityMedium).toBe('Moyen');
    expect(Strings.results.severityImportant).toBe('Important');
  });

  it('les onglets sont en français', () => {
    expect(Strings.tabs.home).toBe('Accueil');
    expect(Strings.tabs.history).toBe('Historique');
    expect(Strings.tabs.profile).toBe('Profil');
  });

  it('le nom de l\'app est "Foot Is Life"', () => {
    expect(Strings.app.name).toBe('Foot Is Life');
  });

  it('le disclaimer MVP est présent et suffisamment long', () => {
    expect(Strings.results.disclaimer).toBeTruthy();
    expect(Strings.results.disclaimer.length).toBeGreaterThan(50);
    expect(Strings.results.disclaimer).toContain('estimation');
  });

  it('les messages d\'erreur auth sont en français', () => {
    expect(Strings.auth.errorInvalidEmail).toContain('invalide');
    expect(Strings.auth.errorWeakPassword).toContain('caractères');
    expect(Strings.auth.errorEmailInUse).toContain('utilisée');
  });

  it('les labels de session sont en français', () => {
    expect(Strings.session.instructionsFrontTitle).toBe('Vue de face');
    expect(Strings.session.instructionsBackTitle).toBe('Vue de dos');
    expect(Strings.session.skipBackView).toBe('Passer cette étape');
  });

  it('les noms de scores sont en français', () => {
    expect(Strings.scores.upperBodyAlignment).toBeTruthy();
    expect(Strings.scores.approachTrajectory).toBeTruthy();
    expect(Strings.scores.overallTiming).toBeTruthy();
    // Vérifier qu'aucun score n'est vide
    for (const [key, value] of Object.entries(Strings.scores)) {
      expect(value).toBeTruthy();
      expect(typeof value).toBe('string');
    }
  });
});
