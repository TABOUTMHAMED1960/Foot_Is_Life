import {
  runAnalysisPipeline,
  PipelineDeps,
  PipelineResult,
} from '@/src/services/analysis/pipeline';
import { AnalysisResult } from '@/src/types/analysis';
import { Strings } from '@/src/constants/strings.fr';

// ── Fixtures ──

const mockAnalysisResult: AnalysisResult = {
  globalScore: 72,
  confidence: 1.0,
  availableAngles: ['front', 'back'],
  subScores: {
    front: {
      upperBodyAlignment: 70,
      stability: 75,
      torsoOpenness: 68,
      gestureSymmetry: 72,
      posturalQuality: 74,
      overall: 72,
    },
    back: {
      approachTrajectory: 71,
      supportFootPlacement: 73,
      strikingLegTrajectory: 69,
      globalGestureAxis: 70,
      postImpactBalance: 72,
      overall: 71,
    },
    common: {
      approachAngle: 70,
      supportFootPosition: 72,
      torsoOrientation: 68,
      strikingLegMovement: 74,
      estimatedContactPoint: 71,
      postStrikeBalance: 73,
      overallTiming: 69,
      overall: 71,
    },
  },
  strengths: ['Bonne stabilité'],
  defects: [{ label: 'Buste fermé', severity: 'moyen', exercises: ['Étirement buste'] }],
  tips: ['Ouvre davantage le buste'],
  disclaimer: 'Analyse simplifiée.',
  analyzedAt: new Date('2026-03-13'),
};

const frontVideo = { uri: 'file://front.mp4', duration: 5, source: 'camera' as const, angle: 'front' as const };
const backVideo = { uri: 'file://back.mp4', duration: 6, source: 'camera' as const, angle: 'back' as const };

function createMockDeps(overrides?: Partial<PipelineDeps>): PipelineDeps {
  return {
    userId: 'user-123',
    frontVideo,
    backVideo,
    saveSession: jest.fn().mockResolvedValue(undefined),
    uploadVideos: jest.fn().mockResolvedValue(true),
    analyze: jest.fn().mockResolvedValue(mockAnalysisResult),
    saveAnalysis: jest.fn().mockResolvedValue(undefined),
    onStep: jest.fn(),
    ...overrides,
  };
}

// ── Tests ──

describe('runAnalysisPipeline', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(1710300000000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('cas nominal : exécute toutes les étapes dans le bon ordre', async () => {
    const deps = createMockDeps();
    const result = await runAnalysisPipeline(deps);

    expect(result.success).toBe(true);
    expect(result.result).toBe(mockAnalysisResult);
    expect(result.error).toBeUndefined();
    expect(result.sessionId).toBe('session-1710300000000');

    // Vérifie l'ordre des appels
    const saveSession = deps.saveSession as jest.Mock;
    const uploadVideos = deps.uploadVideos as jest.Mock;
    const analyze = deps.analyze as jest.Mock;
    const saveAnalysis = deps.saveAnalysis as jest.Mock;
    const onStep = deps.onStep as jest.Mock;

    expect(saveSession).toHaveBeenCalledTimes(1);
    expect(uploadVideos).toHaveBeenCalledTimes(1);
    expect(analyze).toHaveBeenCalledTimes(1);
    expect(saveAnalysis).toHaveBeenCalledTimes(1);

    // Vérifie que saveSession est appelé avant uploadVideos
    const saveOrder = saveSession.mock.invocationCallOrder[0];
    const uploadOrder = uploadVideos.mock.invocationCallOrder[0];
    const analyzeOrder = analyze.mock.invocationCallOrder[0];
    const saveAnalysisOrder = saveAnalysis.mock.invocationCallOrder[0];
    expect(saveOrder).toBeLessThan(uploadOrder);
    expect(uploadOrder).toBeLessThan(analyzeOrder);
    expect(analyzeOrder).toBeLessThan(saveAnalysisOrder);

    // Vérifie les étapes notifiées
    expect(onStep).toHaveBeenCalledWith(0);
    expect(onStep).toHaveBeenCalledWith(1);
    expect(onStep).toHaveBeenCalledWith(2);
    expect(onStep).toHaveBeenCalledWith(3);
  });

  it('passe le bon sessionId et userId à saveSession', async () => {
    const deps = createMockDeps();
    await runAnalysisPipeline(deps);

    const saveSession = deps.saveSession as jest.Mock;
    const session = saveSession.mock.calls[0][0];
    expect(session.id).toBe('session-1710300000000');
    expect(session.userId).toBe('user-123');
    expect(session.status).toBe('analyzing');
    expect(session.videos.front).toBe(frontVideo);
    expect(session.videos.back).toBe(backVideo);
    expect(session.analysis).toBeNull();
  });

  it('passe les vidéos à uploadVideos', async () => {
    const deps = createMockDeps();
    await runAnalysisPipeline(deps);

    const uploadVideos = deps.uploadVideos as jest.Mock;
    expect(uploadVideos).toHaveBeenCalledWith(
      'session-1710300000000',
      frontVideo,
      backVideo
    );
  });

  it('passe le sessionId à analyze', async () => {
    const deps = createMockDeps();
    await runAnalysisPipeline(deps);

    const analyze = deps.analyze as jest.Mock;
    expect(analyze).toHaveBeenCalledWith('session-1710300000000');
  });

  it('passe le sessionId et le résultat à saveAnalysis', async () => {
    const deps = createMockDeps();
    await runAnalysisPipeline(deps);

    const saveAnalysis = deps.saveAnalysis as jest.Mock;
    expect(saveAnalysis).toHaveBeenCalledWith(
      'session-1710300000000',
      mockAnalysisResult
    );
  });

  // ── Échecs ──

  it('échec saveSession : retourne une erreur et ne continue pas', async () => {
    const deps = createMockDeps({
      saveSession: jest.fn().mockRejectedValue(new Error('Firestore down')),
    });

    const result = await runAnalysisPipeline(deps);

    expect(result.success).toBe(false);
    expect(result.error).toBe(Strings.session.analyzingErrorSave);
    expect(deps.uploadVideos).not.toHaveBeenCalled();
    expect(deps.analyze).not.toHaveBeenCalled();
    expect(deps.saveAnalysis).not.toHaveBeenCalled();
  });

  it('échec analyze (throw) : retourne une erreur et ne sauvegarde pas', async () => {
    const deps = createMockDeps({
      analyze: jest.fn().mockRejectedValue(new Error('Analysis crash')),
    });

    const result = await runAnalysisPipeline(deps);

    expect(result.success).toBe(false);
    expect(result.error).toBe(Strings.session.analyzingErrorAnalysis);
    expect(deps.saveSession).toHaveBeenCalledTimes(1);
    expect(deps.uploadVideos).toHaveBeenCalledTimes(1);
    expect(deps.saveAnalysis).not.toHaveBeenCalled();
  });

  it('échec analyze (retourne null) : retourne une erreur', async () => {
    const deps = createMockDeps({
      analyze: jest.fn().mockResolvedValue(null),
    });

    const result = await runAnalysisPipeline(deps);

    expect(result.success).toBe(false);
    expect(result.error).toBe(Strings.session.analyzingErrorAnalysis);
    expect(deps.saveAnalysis).not.toHaveBeenCalled();
  });

  it('échec saveAnalysis : succès avec warning (non bloquant)', async () => {
    const deps = createMockDeps({
      saveAnalysis: jest.fn().mockRejectedValue(new Error('Firestore write failed')),
    });

    const result = await runAnalysisPipeline(deps);

    expect(result.success).toBe(true);
    expect(result.result).toBe(mockAnalysisResult);
    expect(result.warning).toBe(Strings.session.analyzingErrorSave);
  });

  it('échec uploadVideos : succès avec warning', async () => {
    const deps = createMockDeps({
      uploadVideos: jest.fn().mockResolvedValue(false),
    });

    const result = await runAnalysisPipeline(deps);

    expect(result.success).toBe(true);
    expect(result.result).toBe(mockAnalysisResult);
    expect(result.warning).toBe(Strings.session.analyzingUploadFailed);
    // L'analyse continue malgré l'échec d'upload
    expect(deps.analyze).toHaveBeenCalledTimes(1);
    expect(deps.saveAnalysis).toHaveBeenCalledTimes(1);
  });

  // ── Cas limites ──

  it('fonctionne sans vidéo de dos (front seulement)', async () => {
    const deps = createMockDeps({ backVideo: null });
    const result = await runAnalysisPipeline(deps);

    expect(result.success).toBe(true);

    const saveSession = deps.saveSession as jest.Mock;
    expect(saveSession.mock.calls[0][0].videos.back).toBeNull();

    const uploadVideos = deps.uploadVideos as jest.Mock;
    expect(uploadVideos).toHaveBeenCalledWith(
      expect.any(String),
      frontVideo,
      null
    );
  });

  it('fonctionne sans callback onStep', async () => {
    const deps = createMockDeps({ onStep: undefined });
    const result = await runAnalysisPipeline(deps);

    expect(result.success).toBe(true);
  });
});
