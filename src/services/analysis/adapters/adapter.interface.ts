import {
  AnalysisInput,
  FrontAnalysisRaw,
  BackAnalysisRaw,
  CommonAnalysisRaw,
  VideoInput,
} from '../types';

export interface IAnalysisAdapter {
  analyzeFront(video: VideoInput, seed: string): FrontAnalysisRaw;
  analyzeBack(video: VideoInput, seed: string): BackAnalysisRaw;
  analyzeCommon(input: AnalysisInput, seed: string): CommonAnalysisRaw;
}
