import { analyzeFront } from '@/src/services/analysis/front-analyzer';
import { VideoInput } from '@/src/services/analysis/types';

describe('Front Analyzer', () => {
  const video: VideoInput = {
    uri: 'file://test-front.mp4',
    duration: 5,
    source: 'camera',
    angle: 'front',
  };

  it('returns all 5 sub-scores between 0 and 100', () => {
    const result = analyzeFront(video, 'test-seed');

    expect(result.upperBodyAlignment).toBeGreaterThanOrEqual(0);
    expect(result.upperBodyAlignment).toBeLessThanOrEqual(100);
    expect(result.stability).toBeGreaterThanOrEqual(0);
    expect(result.stability).toBeLessThanOrEqual(100);
    expect(result.torsoOpenness).toBeGreaterThanOrEqual(0);
    expect(result.torsoOpenness).toBeLessThanOrEqual(100);
    expect(result.gestureSymmetry).toBeGreaterThanOrEqual(0);
    expect(result.gestureSymmetry).toBeLessThanOrEqual(100);
    expect(result.posturalQuality).toBeGreaterThanOrEqual(0);
    expect(result.posturalQuality).toBeLessThanOrEqual(100);
  });

  it('is deterministic with the same seed', () => {
    const result1 = analyzeFront(video, 'same-seed');
    const result2 = analyzeFront(video, 'same-seed');
    expect(result1).toEqual(result2);
  });

  it('produces different results with different seeds', () => {
    const result1 = analyzeFront(video, 'seed-a');
    const result2 = analyzeFront(video, 'seed-b');
    // At least one score should differ
    const allSame =
      result1.upperBodyAlignment === result2.upperBodyAlignment &&
      result1.stability === result2.stability &&
      result1.torsoOpenness === result2.torsoOpenness;
    expect(allSame).toBe(false);
  });

  it('penalizes very short videos', () => {
    const shortVideo = { ...video, duration: 1 };
    const normalVideo = { ...video, duration: 5 };
    const shortResult = analyzeFront(shortVideo, 'penalty-test');
    const normalResult = analyzeFront(normalVideo, 'penalty-test');

    // Short video should have generally lower scores (due to penalty)
    const shortAvg = Object.values(shortResult).reduce((a, b) => a + b, 0) / 5;
    const normalAvg = Object.values(normalResult).reduce((a, b) => a + b, 0) / 5;
    expect(shortAvg).toBeLessThan(normalAvg);
  });
});
