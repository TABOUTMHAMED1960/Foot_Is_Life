import { analyzeBack } from '@/src/services/analysis/back-analyzer';
import { VideoInput } from '@/src/services/analysis/types';

describe('Back Analyzer', () => {
  const video: VideoInput = {
    uri: 'file://test-back.mp4',
    duration: 6,
    source: 'camera',
    angle: 'back',
  };

  it('returns all 5 sub-scores between 0 and 100', () => {
    const result = analyzeBack(video, 'test-seed');

    expect(result.approachTrajectory).toBeGreaterThanOrEqual(0);
    expect(result.approachTrajectory).toBeLessThanOrEqual(100);
    expect(result.supportFootPlacement).toBeGreaterThanOrEqual(0);
    expect(result.supportFootPlacement).toBeLessThanOrEqual(100);
    expect(result.strikingLegTrajectory).toBeGreaterThanOrEqual(0);
    expect(result.strikingLegTrajectory).toBeLessThanOrEqual(100);
    expect(result.globalGestureAxis).toBeGreaterThanOrEqual(0);
    expect(result.globalGestureAxis).toBeLessThanOrEqual(100);
    expect(result.postImpactBalance).toBeGreaterThanOrEqual(0);
    expect(result.postImpactBalance).toBeLessThanOrEqual(100);
  });

  it('is deterministic with the same seed', () => {
    const result1 = analyzeBack(video, 'same-seed');
    const result2 = analyzeBack(video, 'same-seed');
    expect(result1).toEqual(result2);
  });

  it('produces different results with different seeds', () => {
    const result1 = analyzeBack(video, 'seed-x');
    const result2 = analyzeBack(video, 'seed-y');
    const allSame =
      result1.approachTrajectory === result2.approachTrajectory &&
      result1.supportFootPlacement === result2.supportFootPlacement;
    expect(allSame).toBe(false);
  });

  it('penalizes very long videos', () => {
    const longVideo = { ...video, duration: 45 };
    const normalVideo = { ...video, duration: 6 };
    const longResult = analyzeBack(longVideo, 'long-test');
    const normalResult = analyzeBack(normalVideo, 'long-test');

    const longAvg = Object.values(longResult).reduce((a, b) => a + b, 0) / 5;
    const normalAvg = Object.values(normalResult).reduce((a, b) => a + b, 0) / 5;
    expect(longAvg).toBeLessThan(normalAvg);
  });
});
