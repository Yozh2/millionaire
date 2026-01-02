import { renderHook, act } from '@testing-library/react';
import { useGameCardImage } from './useGameCardImage';

describe('useGameCardImage', () => {
  it('returns an initial source and updates load state', () => {
    const { result } = renderHook(() => useGameCardImage('poc'));

    expect(result.current.imageSrc).toContain('games/poc/icons/game-card.webp');
    expect(result.current.isGameCardArt).toBe(true);
    expect(result.current.isImageReady).toBe(false);

    act(() => {
      result.current.onImageLoad();
    });

    expect(result.current.isImageReady).toBe(true);
  });

  it('advances to the next source on error', () => {
    const { result } = renderHook(() => useGameCardImage('poc'));

    const initialSrc = result.current.imageSrc;
    act(() => {
      result.current.onImageError();
    });

    expect(result.current.imageSrc).not.toBe(initialSrc);
  });
});
