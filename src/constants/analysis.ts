export const AnalysisWeights = {
  common: 0.4,
  front: 0.3,
  back: 0.3,
};

export const SingleAngleWeights = {
  common: 0.5,
  available: 0.5,
};

export const ConfidenceLevels = {
  dualAngle: 1.0,
  singleAngle: 0.6,
};

export const ScoreBaseline = 65;
export const ScoreVariance = 15;
export const MinScore = 0;
export const MaxScore = 100;

export const DurationPenalty = {
  tooShort: 2,
  tooLong: 30,
  penaltyAmount: 10,
};

export const TipsConfig = {
  maxStrengths: 3,
  maxDefects: 3,
  strengthThreshold: 70,
  defectThreshold: 55,
  maxExercisesPerDefect: 2,
};

export const SeverityThresholds = {
  important: 35,
  medium: 50,
  light: 65,
};
