import { syncPendingSessions, SyncDeps } from '@/src/services/local/syncService';
import * as offlineStore from '@/src/services/local/offlineStore';
import { AnalysisResult } from '@/src/types/analysis';
import { Session } from '@/src/types/session';
import { VideoData } from '@/src/types/video';

// ── Mocks ──
jest.mock('expo-file-system', () => ({}));
jest.mock('@/src/services/local/offlineStore');

const mockGetPending = offlineStore.getPendingSessions as jest.MockedFunction<
  typeof offlineStore.getPendingSessions
>;
const mockRemove = offlineStore.removePendingSession as jest.MockedFunction<
  typeof offlineStore.removePendingSession
>;

// ── Fixtures ──

const fakeAnalysis: AnalysisResult = {
  globalScore: 70,
  confidence: 1.0,
  availableAngles: ['front'],
  subScores: {
    front: {
      upperBodyAlignment: 70, stability: 70, torsoOpenness: 70,
      gestureSymmetry: 70, posturalQuality: 70, overall: 70,
    },
    back: null,
    common: {
      approachAngle: 70, supportFootPosition: 70, torsoOrientation: 70,
      strikingLegMovement: 70, estimatedContactPoint: 70, postStrikeBalance: 70,
      overallTiming: 70, overall: 70,
    },
  },
  strengths: ['Stabilité'],
  defects: [],
  tips: [],
  disclaimer: 'Test',
  analyzedAt: new Date('2026-03-13'),
};

const frontVideo: VideoData = {
  uri: 'file:///local/front.mp4',
  duration: 5,
  source: 'camera',
  angle: 'front',
};

const backVideo: VideoData = {
  uri: 'file:///local/back.mp4',
  duration: 6,
  source: 'camera',
  angle: 'back',
};

const fakeSession: Session = {
  id: 'session-1',
  userId: 'user-1',
  createdAt: new Date('2026-03-13'),
  status: 'completed',
  videos: { front: null, back: null },
  analysis: fakeAnalysis,
};

function makePending(
  id: string,
  analysis: AnalysisResult | null = fakeAnalysis,
  videos?: { front?: VideoData | null; back?: VideoData | null }
): offlineStore.PendingSession {
  return {
    session: {
      ...fakeSession,
      id,
      videos: {
        front: videos?.front ?? null,
        back: videos?.back ?? null,
      },
    },
    analysis,
    savedAt: new Date().toISOString(),
  };
}

function createMockDeps(overrides?: Partial<SyncDeps>): SyncDeps {
  return {
    saveSession: jest.fn().mockResolvedValue(undefined),
    saveAnalysis: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

const fakeUploadResult = {
  storagePath: 'videos/user-1/session-1/front.mp4',
  downloadURL: 'https://storage.example.com/front.mp4',
  fileSize: 1024,
};

// ── Tests ──

describe('syncPendingSessions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRemove.mockResolvedValue(undefined);
  });

  // ── Data sync (existants) ──

  it('ne fait rien s\'il n\'y a aucune séance en attente', async () => {
    mockGetPending.mockResolvedValue([]);
    const deps = createMockDeps();

    const result = await syncPendingSessions(deps);

    expect(result).toEqual({ synced: 0, failed: 0, videosUploaded: 0, videosFailed: 0 });
    expect(deps.saveSession).not.toHaveBeenCalled();
  });

  it('synchronise une séance avec analyse', async () => {
    mockGetPending.mockResolvedValue([makePending('s-1')]);
    const deps = createMockDeps();

    const result = await syncPendingSessions(deps);

    expect(result.synced).toBe(1);
    expect(result.failed).toBe(0);
    expect(deps.saveSession).toHaveBeenCalledTimes(1);
    expect(deps.saveAnalysis).toHaveBeenCalledWith('s-1', fakeAnalysis);
    expect(mockRemove).toHaveBeenCalledWith('s-1');
  });

  it('synchronise une séance sans analyse', async () => {
    mockGetPending.mockResolvedValue([makePending('s-2', null)]);
    const deps = createMockDeps();

    const result = await syncPendingSessions(deps);

    expect(result.synced).toBe(1);
    expect(deps.saveAnalysis).not.toHaveBeenCalled();
  });

  it('gère les échecs individuellement sans bloquer les autres', async () => {
    mockGetPending.mockResolvedValue([
      makePending('s-ok'),
      makePending('s-fail'),
      makePending('s-ok2'),
    ]);
    const deps = createMockDeps({
      saveSession: jest.fn()
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce(undefined),
    });

    const result = await syncPendingSessions(deps);

    expect(result).toEqual({ synced: 2, failed: 1, videosUploaded: 0, videosFailed: 0 });
    expect(mockRemove).toHaveBeenCalledWith('s-ok');
    expect(mockRemove).not.toHaveBeenCalledWith('s-fail');
    expect(mockRemove).toHaveBeenCalledWith('s-ok2');
  });

  it('compte un échec si saveAnalysis échoue', async () => {
    mockGetPending.mockResolvedValue([makePending('s-1')]);
    const deps = createMockDeps({
      saveAnalysis: jest.fn().mockRejectedValue(new Error('Firestore error')),
    });

    const result = await syncPendingSessions(deps);

    expect(result.failed).toBe(1);
    expect(result.synced).toBe(0);
    expect(mockRemove).not.toHaveBeenCalled();
  });

  // ── Upload vidéos différé ──

  it('uploade les vidéos si les deps sont fournis', async () => {
    const uploadVideo = jest.fn().mockResolvedValue(fakeUploadResult);
    const updateVideoMeta = jest.fn().mockResolvedValue(undefined);

    mockGetPending.mockResolvedValue([
      makePending('s-1', fakeAnalysis, { front: frontVideo, back: backVideo }),
    ]);

    const deps = createMockDeps({ uploadVideo, updateVideoMeta });
    const result = await syncPendingSessions(deps);

    expect(result.synced).toBe(1);
    expect(result.videosUploaded).toBe(2);
    expect(result.videosFailed).toBe(0);

    // Vérifie que les 2 vidéos ont été uploadées
    expect(uploadVideo).toHaveBeenCalledTimes(2);
    expect(uploadVideo).toHaveBeenCalledWith('user-1', 's-1', 'front', 'file:///local/front.mp4');
    expect(uploadVideo).toHaveBeenCalledWith('user-1', 's-1', 'back', 'file:///local/back.mp4');

    // Vérifie que les métadonnées ont été sauvegardées
    expect(updateVideoMeta).toHaveBeenCalledTimes(2);
    expect(updateVideoMeta).toHaveBeenCalledWith('s-1', 'front', {
      storagePath: fakeUploadResult.storagePath,
      downloadURL: fakeUploadResult.downloadURL,
      fileSize: fakeUploadResult.fileSize,
      duration: 5,
    });
  });

  it('ne bloque pas la synchro si l\'upload vidéo échoue', async () => {
    const uploadVideo = jest.fn().mockRejectedValue(new Error('file not found'));
    const updateVideoMeta = jest.fn();

    mockGetPending.mockResolvedValue([
      makePending('s-1', fakeAnalysis, { front: frontVideo }),
    ]);

    const deps = createMockDeps({ uploadVideo, updateVideoMeta });
    const result = await syncPendingSessions(deps);

    // La séance est quand même synchronisée (data OK)
    expect(result.synced).toBe(1);
    expect(result.videosUploaded).toBe(0);
    expect(result.videosFailed).toBe(1);
    // La séance locale est supprimée malgré l'échec vidéo
    expect(mockRemove).toHaveBeenCalledWith('s-1');
  });

  it('ignore l\'upload vidéo si les deps ne sont pas fournis', async () => {
    mockGetPending.mockResolvedValue([
      makePending('s-1', fakeAnalysis, { front: frontVideo }),
    ]);

    const deps = createMockDeps(); // pas de uploadVideo/updateVideoMeta
    const result = await syncPendingSessions(deps);

    expect(result.synced).toBe(1);
    expect(result.videosUploaded).toBe(0);
    expect(result.videosFailed).toBe(0);
  });

  it('gère une séance sans vidéos', async () => {
    const uploadVideo = jest.fn();
    const updateVideoMeta = jest.fn();

    mockGetPending.mockResolvedValue([
      makePending('s-1', fakeAnalysis), // pas de vidéos
    ]);

    const deps = createMockDeps({ uploadVideo, updateVideoMeta });
    const result = await syncPendingSessions(deps);

    expect(result.synced).toBe(1);
    expect(result.videosUploaded).toBe(0);
    expect(uploadVideo).not.toHaveBeenCalled();
  });

  it('uploade partiellement si une vidéo échoue et l\'autre réussit', async () => {
    const uploadVideo = jest.fn()
      .mockResolvedValueOnce(fakeUploadResult)  // front OK
      .mockRejectedValueOnce(new Error('fail')); // back fail
    const updateVideoMeta = jest.fn().mockResolvedValue(undefined);

    mockGetPending.mockResolvedValue([
      makePending('s-1', fakeAnalysis, { front: frontVideo, back: backVideo }),
    ]);

    const deps = createMockDeps({ uploadVideo, updateVideoMeta });
    const result = await syncPendingSessions(deps);

    expect(result.synced).toBe(1);
    expect(result.videosUploaded).toBe(1);
    expect(result.videosFailed).toBe(1);
    // Seule la vidéo front a ses métadonnées sauvegardées
    expect(updateVideoMeta).toHaveBeenCalledTimes(1);
    expect(updateVideoMeta).toHaveBeenCalledWith('s-1', 'front', expect.anything());
  });
});
