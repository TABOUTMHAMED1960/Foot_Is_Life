import { syncPendingSessions, SyncDeps } from '@/src/services/local/syncService';
import * as offlineStore from '@/src/services/local/offlineStore';
import { AnalysisResult } from '@/src/types/analysis';
import { Session } from '@/src/types/session';

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
      upperBodyAlignment: 70,
      stability: 70,
      torsoOpenness: 70,
      gestureSymmetry: 70,
      posturalQuality: 70,
      overall: 70,
    },
    back: null,
    common: {
      approachAngle: 70,
      supportFootPosition: 70,
      torsoOrientation: 70,
      strikingLegMovement: 70,
      estimatedContactPoint: 70,
      postStrikeBalance: 70,
      overallTiming: 70,
      overall: 70,
    },
  },
  strengths: ['Stabilité'],
  defects: [],
  tips: [],
  disclaimer: 'Test',
  analyzedAt: new Date('2026-03-13'),
};

const fakeSession: Session = {
  id: 'session-1',
  userId: 'user-1',
  createdAt: new Date('2026-03-13'),
  status: 'completed',
  videos: { front: null, back: null },
  analysis: fakeAnalysis,
};

function makePending(id: string, analysis: AnalysisResult | null = fakeAnalysis): offlineStore.PendingSession {
  return {
    session: { ...fakeSession, id },
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

// ── Tests ──

describe('syncPendingSessions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRemove.mockResolvedValue(undefined);
  });

  it('ne fait rien s\'il n\'y a aucune séance en attente', async () => {
    mockGetPending.mockResolvedValue([]);
    const deps = createMockDeps();

    const result = await syncPendingSessions(deps);

    expect(result).toEqual({ synced: 0, failed: 0 });
    expect(deps.saveSession).not.toHaveBeenCalled();
  });

  it('synchronise une séance avec analyse', async () => {
    mockGetPending.mockResolvedValue([makePending('s-1')]);
    const deps = createMockDeps();

    const result = await syncPendingSessions(deps);

    expect(result).toEqual({ synced: 1, failed: 0 });
    expect(deps.saveSession).toHaveBeenCalledTimes(1);
    expect(deps.saveAnalysis).toHaveBeenCalledWith('s-1', fakeAnalysis);
    expect(mockRemove).toHaveBeenCalledWith('s-1');
  });

  it('synchronise une séance sans analyse', async () => {
    mockGetPending.mockResolvedValue([makePending('s-2', null)]);
    const deps = createMockDeps();

    const result = await syncPendingSessions(deps);

    expect(result).toEqual({ synced: 1, failed: 0 });
    expect(deps.saveSession).toHaveBeenCalledTimes(1);
    expect(deps.saveAnalysis).not.toHaveBeenCalled();
    expect(mockRemove).toHaveBeenCalledWith('s-2');
  });

  it('gère les échecs individuellement sans bloquer les autres', async () => {
    mockGetPending.mockResolvedValue([
      makePending('s-ok'),
      makePending('s-fail'),
      makePending('s-ok2'),
    ]);
    const deps = createMockDeps({
      saveSession: jest.fn()
        .mockResolvedValueOnce(undefined)      // s-ok
        .mockRejectedValueOnce(new Error('fail')) // s-fail
        .mockResolvedValueOnce(undefined),     // s-ok2
    });

    const result = await syncPendingSessions(deps);

    expect(result).toEqual({ synced: 2, failed: 1 });
    // Seules les séances réussies sont retirées
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

    expect(result).toEqual({ synced: 0, failed: 1 });
    expect(mockRemove).not.toHaveBeenCalled();
  });
});
