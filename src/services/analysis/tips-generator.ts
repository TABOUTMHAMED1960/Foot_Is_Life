import { Defect, Severity } from '@/src/types/analysis';
import { MergeResult } from './score-merger';
import { Strings } from '@/src/constants/strings.fr';
import { TipsConfig, SeverityThresholds } from '@/src/constants/analysis';

interface ScoreEntry {
  key: string;
  label: string;
  score: number;
}

const strengthTemplates: Record<string, string> = {
  upperBodyAlignment: 'Bon alignement du haut du corps, continue comme ça !',
  stability: 'Ta stabilité pendant la frappe est solide.',
  torsoOpenness: 'Belle ouverture du buste, ça aide à viser juste.',
  gestureSymmetry: 'Geste symétrique et fluide, c\'est un vrai atout.',
  posturalQuality: 'Ta posture globale est bien maîtrisée.',
  approachTrajectory: 'Ta trajectoire d\'approche est bien calibrée.',
  supportFootPlacement: 'Bon placement du pied d\'appui, c\'est la base.',
  strikingLegTrajectory: 'Belle trajectoire de la jambe de frappe.',
  globalGestureAxis: 'L\'axe global de ton geste est bien aligné.',
  postImpactBalance: 'Bon équilibre après l\'impact, signe de maîtrise.',
  approachAngle: 'Angle d\'approche bien géré.',
  supportFootPosition: 'Position du pied d\'appui correcte.',
  torsoOrientation: 'Bonne orientation du buste pendant la frappe.',
  strikingLegMovement: 'Mouvement de la jambe de frappe efficace.',
  estimatedContactPoint: 'Le point de contact semble bien placé.',
  postStrikeBalance: 'Bon équilibre après la frappe.',
  overallTiming: 'Timing global du geste bien coordonné.',
};

const defectTemplates: Record<string, { label: string; exercises: string[] }> = {
  upperBodyAlignment: {
    label: 'Ton alignement du haut du corps peut être amélioré.',
    exercises: [
      'Exercice : tiens-toi droit face à un mur, bras le long du corps, et simule le geste de frappe au ralenti.',
      'Exercice : fais des frappes sans élan en te concentrant sur la posture du haut du corps.',
    ],
  },
  stability: {
    label: 'Ta stabilité pendant la frappe semble insuffisante.',
    exercises: [
      'Exercice : travaille l\'équilibre sur un pied pendant 30 secondes, puis enchaîne une frappe.',
      'Exercice : fais des squats sur une jambe pour renforcer ta stabilité.',
    ],
  },
  torsoOpenness: {
    label: 'Ton buste semble trop fermé ou trop ouvert pendant la frappe.',
    exercises: [
      'Exercice : place un plot devant toi et entraîne-toi à viser en ouvrant le buste vers la cible.',
      'Exercice : filme-toi de face et compare l\'ouverture de ton buste avec une vidéo de référence.',
    ],
  },
  gestureSymmetry: {
    label: 'Ton geste manque de symétrie.',
    exercises: [
      'Exercice : frappe le ballon en alternant pied droit et pied gauche pour équilibrer ton geste.',
      'Exercice : travaille des frappes lentes en miroir devant un mur.',
    ],
  },
  posturalQuality: {
    label: 'Ta posture globale peut être améliorée.',
    exercises: [
      'Exercice : fais du gainage (planche) 3x30 secondes avant chaque séance.',
      'Exercice : travaille des étirements dynamiques avant de frapper.',
    ],
  },
  approachTrajectory: {
    label: 'Ta trajectoire d\'approche vers le ballon n\'est pas optimale.',
    exercises: [
      'Exercice : place 3 plots en ligne et approche le ballon en suivant une courbe légère.',
      'Exercice : filme-toi de dos et analyse l\'angle de ta course d\'élan.',
    ],
  },
  supportFootPlacement: {
    label: 'Ton pied d\'appui semble mal placé par rapport au ballon.',
    exercises: [
      'Exercice : place un repère au sol à côté du ballon et entraîne-toi à poser ton pied d\'appui dessus.',
      'Exercice : fais 10 frappes en te concentrant uniquement sur le placement du pied d\'appui.',
    ],
  },
  strikingLegTrajectory: {
    label: 'La trajectoire de ta jambe de frappe peut être améliorée.',
    exercises: [
      'Exercice : fais des mouvements de balancier avec ta jambe de frappe sans ballon.',
      'Exercice : frappe dans un ballon suspendu pour travailler la trajectoire.',
    ],
  },
  globalGestureAxis: {
    label: 'L\'axe global de ton geste n\'est pas bien aligné.',
    exercises: [
      'Exercice : trace une ligne au sol vers la cible et aligne tout ton geste dessus.',
      'Exercice : frappe au ralenti en vérifiant que ton corps reste dans l\'axe.',
    ],
  },
  postImpactBalance: {
    label: 'Ton équilibre après l\'impact est à travailler.',
    exercises: [
      'Exercice : après chaque frappe, essaie de rester en équilibre sur ton pied d\'appui 3 secondes.',
      'Exercice : travaille des frappes suivies d\'une réception contrôlée.',
    ],
  },
  approachAngle: {
    label: 'Ton angle d\'approche du ballon n\'est pas idéal.',
    exercises: [
      'Exercice : varie tes angles d\'approche (frontal, 30°, 45°) et compare les résultats.',
    ],
  },
  supportFootPosition: {
    label: 'La position de ton pied d\'appui n\'est pas optimale.',
    exercises: [
      'Exercice : marque au sol la position idéale et répète 20 frappes en la visant.',
    ],
  },
  torsoOrientation: {
    label: 'Ton buste n\'est pas bien orienté vers la cible.',
    exercises: [
      'Exercice : regarde la cible avant de frapper et oriente tes épaules vers elle.',
    ],
  },
  strikingLegMovement: {
    label: 'Le mouvement de ta jambe de frappe manque d\'amplitude.',
    exercises: [
      'Exercice : travaille des mouvements pendulaires amples sans ballon.',
      'Exercice : étire tes fléchisseurs de hanche avant la séance.',
    ],
  },
  estimatedContactPoint: {
    label: 'Le point de contact avec le ballon ne semble pas optimal.',
    exercises: [
      'Exercice : frappe le ballon avec le cou-de-pied en visant le centre du ballon.',
    ],
  },
  postStrikeBalance: {
    label: 'Ton équilibre après la frappe est insuffisant.',
    exercises: [
      'Exercice : concentre-toi sur un atterrissage stable après chaque frappe.',
    ],
  },
  overallTiming: {
    label: 'Le timing global de ton geste peut être amélioré.',
    exercises: [
      'Exercice : frappe au ralenti puis accélère progressivement pour trouver ton rythme.',
    ],
  },
};

function getSeverity(score: number): Severity {
  if (score < SeverityThresholds.important) return 'important';
  if (score < SeverityThresholds.medium) return 'moyen';
  return 'léger';
}

function getAllScoreEntries(result: MergeResult): ScoreEntry[] {
  const entries: ScoreEntry[] = [];

  if (result.subScores.front) {
    const f = result.subScores.front;
    entries.push(
      { key: 'upperBodyAlignment', label: Strings.scores.upperBodyAlignment, score: f.upperBodyAlignment },
      { key: 'stability', label: Strings.scores.stability, score: f.stability },
      { key: 'torsoOpenness', label: Strings.scores.torsoOpenness, score: f.torsoOpenness },
      { key: 'gestureSymmetry', label: Strings.scores.gestureSymmetry, score: f.gestureSymmetry },
      { key: 'posturalQuality', label: Strings.scores.posturalQuality, score: f.posturalQuality },
    );
  }

  if (result.subScores.back) {
    const b = result.subScores.back;
    entries.push(
      { key: 'approachTrajectory', label: Strings.scores.approachTrajectory, score: b.approachTrajectory },
      { key: 'supportFootPlacement', label: Strings.scores.supportFootPlacement, score: b.supportFootPlacement },
      { key: 'strikingLegTrajectory', label: Strings.scores.strikingLegTrajectory, score: b.strikingLegTrajectory },
      { key: 'globalGestureAxis', label: Strings.scores.globalGestureAxis, score: b.globalGestureAxis },
      { key: 'postImpactBalance', label: Strings.scores.postImpactBalance, score: b.postImpactBalance },
    );
  }

  const c = result.subScores.common;
  entries.push(
    { key: 'approachAngle', label: Strings.scores.approachAngle, score: c.approachAngle },
    { key: 'supportFootPosition', label: Strings.scores.supportFootPosition, score: c.supportFootPosition },
    { key: 'torsoOrientation', label: Strings.scores.torsoOrientation, score: c.torsoOrientation },
    { key: 'strikingLegMovement', label: Strings.scores.strikingLegMovement, score: c.strikingLegMovement },
    { key: 'estimatedContactPoint', label: Strings.scores.estimatedContactPoint, score: c.estimatedContactPoint },
    { key: 'postStrikeBalance', label: Strings.scores.postStrikeBalance, score: c.postStrikeBalance },
    { key: 'overallTiming', label: Strings.scores.overallTiming, score: c.overallTiming },
  );

  return entries;
}

export function generateStrengths(result: MergeResult): string[] {
  const entries = getAllScoreEntries(result);
  return entries
    .filter((e) => e.score >= TipsConfig.strengthThreshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, TipsConfig.maxStrengths)
    .map((e) => strengthTemplates[e.key] || `${e.label} : bon niveau.`)
    ;
}

export function generateDefects(result: MergeResult): Defect[] {
  const entries = getAllScoreEntries(result);
  return entries
    .filter((e) => e.score < TipsConfig.defectThreshold)
    .sort((a, b) => a.score - b.score)
    .slice(0, TipsConfig.maxDefects)
    .map((e) => {
      const template = defectTemplates[e.key];
      return {
        label: template?.label || `${e.label} : à améliorer.`,
        severity: getSeverity(e.score),
        exercises: (template?.exercises || []).slice(0, TipsConfig.maxExercisesPerDefect),
      };
    });
}

export function generateTips(result: MergeResult): string[] {
  const tips: string[] = [];

  if (result.confidence < 1.0) {
    tips.push(
      'Pour une analyse plus précise, filme ta frappe sous les deux angles (devant et derrière).'
    );
  }

  if (result.globalScore < 50) {
    tips.push(
      'Concentre-toi sur les bases : placement du pied d\'appui et équilibre. Le reste suivra.'
    );
  } else if (result.globalScore < 70) {
    tips.push(
      'Tu as de bonnes bases ! Travaille les détails comme l\'ouverture du buste et le timing.'
    );
  } else {
    tips.push(
      'Très bon niveau ! Continue à filmer tes séances pour suivre ta progression.'
    );
  }

  const entries = getAllScoreEntries(result);
  const worst = entries.sort((a, b) => a.score - b.score)[0];
  if (worst && worst.score < 60) {
    tips.push(
      `Ton point d'attention principal : ${worst.label.toLowerCase()}. Travaille-le en priorité.`
    );
  }

  return tips;
}
