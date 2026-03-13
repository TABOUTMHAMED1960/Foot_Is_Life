import { IAnalysisAdapter } from './adapter.interface';
import { AnalysisInput, VideoInput, FrontAnalysisRaw, BackAnalysisRaw, CommonAnalysisRaw } from '../types';

/**
 * Stub ML Adapter - À remplacer par un vrai module de computer vision
 * (MediaPipe, TFLite, ou API cloud) dans une version future.
 *
 * Pour l'activer :
 * 1. Implémenter les méthodes ci-dessous avec pose estimation réelle
 * 2. Changer l'adapter dans engine.ts : new MLAdapter() au lieu de HeuristicAdapter()
 */
export class MLAdapter implements IAnalysisAdapter {
  analyzeFront(_video: VideoInput, _seed: string): FrontAnalysisRaw {
    throw new Error(
      'MLAdapter non implémenté. Utilisez HeuristicAdapter pour le MVP.'
    );
  }

  analyzeBack(_video: VideoInput, _seed: string): BackAnalysisRaw {
    throw new Error(
      'MLAdapter non implémenté. Utilisez HeuristicAdapter pour le MVP.'
    );
  }

  analyzeCommon(_input: AnalysisInput, _seed: string): CommonAnalysisRaw {
    throw new Error(
      'MLAdapter non implémenté. Utilisez HeuristicAdapter pour le MVP.'
    );
  }
}
