import { renderHook, act } from '@testing-library/react';
import {
  buildBackgroundGradient,
  createEmojiLogo,
  getRingMetrics,
  toRgba,
  useSmoothedProgress,
  useViewportSize,
} from './loadingScreenLogic';

describe('loadingScreenLogic', () => {
  it('converts hex to rgba', () => {
    expect(toRgba('#ffffff', 0.5)).toBe('rgba(255, 255, 255, 0.5)');
    expect(toRgba('#abc', 0.25)).toBe('rgba(170, 187, 204, 0.25)');
  });

  it('creates a data uri for emoji logo', () => {
    const dataUri = createEmojiLogo('A');
    expect(dataUri.startsWith('data:image/svg+xml,')).toBe(true);
    expect(dataUri).toContain('A');
  });

  it('builds a background gradient', () => {
    const gradient = buildBackgroundGradient('#111111');
    expect(gradient).toContain('radial-gradient');
  });

  it('computes ring metrics', () => {
    const ring = getRingMetrics(50, false, { width: 800, height: 600 });
    expect(ring.ringSize).toBeGreaterThan(0);
    expect(ring.progressDasharray).toContain(' ');
    expect(typeof ring.glintVisible).toBe('boolean');
  });

  it('tracks smoothed progress state', () => {
    const { result, rerender } = renderHook(
      ({ progress }) => useSmoothedProgress(progress),
      { initialProps: { progress: 40 } }
    );

    expect(result.current.isIndeterminate).toBe(false);
    expect(result.current.displayProgress).toBe(40);

    rerender({ progress: undefined });
    expect(result.current.isIndeterminate).toBe(true);
  });

  it('tracks viewport size updates', () => {
    Object.defineProperty(window, 'innerWidth', { value: 900, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 700, writable: true });

    const { result } = renderHook(() => useViewportSize());

    expect(result.current.width).toBe(900);
    expect(result.current.height).toBe(700);

    act(() => {
      window.innerWidth = 640;
      window.innerHeight = 480;
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.width).toBe(640);
    expect(result.current.height).toBe(480);
  });
});
