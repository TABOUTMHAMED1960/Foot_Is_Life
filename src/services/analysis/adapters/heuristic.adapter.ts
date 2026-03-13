import { IAnalysisAdapter } from './adapter.interface';
import { AnalysisInput, VideoInput, FrontAnalysisRaw, BackAnalysisRaw, CommonAnalysisRaw } from '../types';
import { analyzeFront } from '../front-analyzer';
import { analyzeBack } from '../back-analyzer';
import { analyzeCommon } from '../common-analyzer';

export class HeuristicAdapter implements IAnalysisAdapter {
  analyzeFront(video: VideoInput, seed: string): FrontAnalysisRaw {
    return analyzeFront(video, seed);
  }

  analyzeBack(video: VideoInput, seed: string): BackAnalysisRaw {
    return analyzeBack(video, seed);
  }

  analyzeCommon(input: AnalysisInput, seed: string): CommonAnalysisRaw {
    return analyzeCommon(input, seed);
  }
}
