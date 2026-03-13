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
  /** Fallback local quand Firestore échoue. */
  saveLocal?: (session: Session, analysis: AnalysisResult | null) => Promise<void>;
  onStep?: (step: number) => void;
}

export interface PipelineResult {
  success: boolean;
  sessionId: string;
  result?: AnalysisResult;
  error?: string;
  warning?: string;
  /** true si la séance a été sauvegardée localement en fallback. */
  savedOffline?: boolean;
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
    saveLocal,
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

  let firestoreAvailable = true;

  try {
    await saveSession(session);
  } catch {
    firestoreAvailable = false;
    // Pas de fallback local ici — on continue l'analyse d'abord
  }

  // ── Étape 1 : Upload des vidéos ──
  onStep?.(0);
  let warning: string | undefined;

  if (firestoreAvailable) {
    const uploadOk = await uploadVideos(sessionId, frontVideo, backVideo);
    if (!uploadOk) {
      warning = Strings.session.analyzingUploadFailed;
    }
  } else {
    // Pas d'upload si Firestore est down (le document n'existe pas)
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
  let savedOffline = false;

  if (firestoreAvailable) {
    try {
      await saveAnalysis(sessionId, result);
    } catch {
      // Firestore a échoué à la sauvegarde de l'analyse — fallback local
      firestoreAvailable = false;
    }
  }

  if (!firestoreAvailable && saveLocal) {
    try {
      await saveLocal(session, result);
      savedOffline = true;
      warning = Strings.offline.savedLocally;
    } catch {
      warning = Strings.session.analyzingErrorSave;
    }
  } else if (!firestoreAvailable) {
    warning = Strings.session.analyzingErrorSave;
  }

  onStep?.(3);

  return {
    success: true,
    sessionId,
    result,
    warning,
    savedOffline,
  };
}
