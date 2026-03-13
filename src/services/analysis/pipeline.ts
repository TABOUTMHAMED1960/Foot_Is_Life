import { VideoData } from '@/src/types/video';
import { AnalysisResult } from '@/src/types/analysis';
import { Session } from '@/src/types/session';
import { Strings } from '@/src/constants/strings.fr';

export interface PipelineDeps {
  userId: string;
  frontVideo: VideoData | null;
  backVideo: VideoData | null;
  saveSession: (session: Session) => Promise<void>;
  uploadVideos: (
    sessionId: string,
    front: VideoData | null,
    back: VideoData | null
  ) => Promise<boolean>;
  analyze: (sessionId: string) => Promise<AnalysisResult | null>;
  saveAnalysis: (sessionId: string, analysis: AnalysisResult) => Promise<void>;
  onStep?: (step: number) => void;
}

export interface PipelineResult {
  success: boolean;
  sessionId: string;
  result?: AnalysisResult;
  error?: string;
  warning?: string;
}

export async function runAnalysisPipeline(
  deps: PipelineDeps
): Promise<PipelineResult> {
  const sessionId = `session-${Date.now()}`;
  const {
    userId,
    frontVideo,
    backVideo,
    saveSession,
    uploadVideos,
    analyze,
    saveAnalysis,
    onStep,
  } = deps;

  // ── Étape 0 : Créer la session ──
  const session: Session = {
    id: sessionId,
    userId,
    createdAt: new Date(),
    status: 'analyzing',
    videos: {
      front: frontVideo,
      back: backVideo,
    },
    analysis: null,
  };

  try {
    await saveSession(session);
  } catch {
    return {
      success: false,
      sessionId,
      error: Strings.session.analyzingErrorSave,
    };
  }

  // ── Étape 1 : Upload des vidéos ──
  onStep?.(0);
  let warning: string | undefined;

  const uploadOk = await uploadVideos(sessionId, frontVideo, backVideo);
  if (!uploadOk) {
    warning = Strings.session.analyzingUploadFailed;
  }

  // ── Étape 2 : Analyse ──
  onStep?.(1);
  let result: AnalysisResult | null;
  try {
    result = await analyze(sessionId);
  } catch {
    return {
      success: false,
      sessionId,
      error: Strings.session.analyzingErrorAnalysis,
    };
  }

  if (!result) {
    return {
      success: false,
      sessionId,
      error: Strings.session.analyzingErrorAnalysis,
    };
  }

  // ── Étape 3 : Sauvegarde de l'analyse ──
  onStep?.(2);
  try {
    await saveAnalysis(sessionId, result);
  } catch {
    // Non bloquant — l'utilisateur verra ses résultats
    warning = Strings.session.analyzingErrorSave;
  }

  onStep?.(3);

  return {
    success: true,
    sessionId,
    result,
    warning,
  };
}
