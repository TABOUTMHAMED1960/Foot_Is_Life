import { useState, useCallback } from 'react';
import { analysisEngine } from '@/src/services/analysis/engine';
import { AnalysisInput } from '@/src/services/analysis/types';
import { AnalysisResult } from '@/src/types/analysis';
import { useSessionStore } from '@/src/stores/sessionStore';

export function useAnalysis() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (sessionId: string) => {
    const { draft } = useSessionStore.getState();

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const input: AnalysisInput = {
        sessionId,
        frontVideo: draft.frontVideo
          ? {
              uri: draft.frontVideo.uri,
              duration: draft.frontVideo.duration,
              source: draft.frontVideo.source,
              angle: 'front',
            }
          : null,
        backVideo: draft.backVideo
          ? {
              uri: draft.backVideo.uri,
              duration: draft.backVideo.duration,
              source: draft.backVideo.source,
              angle: 'back',
            }
          : null,
      };

      // Simule un petit délai pour le MVP (l'analyse heuristique est instantanée)
      await new Promise((resolve) => setTimeout(resolve, 500));

      const analysisResult = analysisEngine.analyze(input);
      setResult(analysisResult);
      return analysisResult;
    } catch {
      setError("Une erreur est survenue pendant l'analyse.");
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    result,
    isAnalyzing,
    error,
    analyze,
  };
}
