import { IAnalysisAdapter } from './adapters/adapter.interface';
import { HeuristicAdapter } from './adapters/heuristic.adapter';
import { AnalysisInput } from './types';
import { AnalysisResult } from '@/src/types/analysis';
import { mergeScores } from './score-merger';
import { generateStrengths, generateDefects, generateTips } from './tips-generator';
import { Strings } from '@/src/constants/strings.fr';

export class AnalysisEngine {
  private adapter: IAnalysisAdapter;

  constructor(adapter?: IAnalysisAdapter) {
    this.adapter = adapter ?? new HeuristicAdapter();
  }

  analyze(input: AnalysisInput): AnalysisResult {
    const seed = input.sessionId;

    // Analyse par angle
    const frontRaw = input.frontVideo
      ? this.adapter.analyzeFront(input.frontVideo, seed)
      : null;

    const backRaw = input.backVideo
      ? this.adapter.analyzeBack(input.backVideo, seed)
      : null;

    // Analyse commune (toujours présente)
    const commonRaw = this.adapter.analyzeCommon(input, seed);

    // Fusion des scores
    const merged = mergeScores({ frontRaw, backRaw, commonRaw });

    // Génération du feedback
    const strengths = generateStrengths(merged);
    const defects = generateDefects(merged);
    const tips = generateTips(merged);

    return {
      globalScore: merged.globalScore,
      confidence: merged.confidence,
      availableAngles: merged.availableAngles,
      subScores: merged.subScores,
      strengths,
      defects,
      tips,
      disclaimer: Strings.results.disclaimer,
      analyzedAt: new Date(),
    };
  }
}

// Instance par défaut avec l'adapter heuristique
export const analysisEngine = new AnalysisEngine();
