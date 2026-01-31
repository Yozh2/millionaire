import { renderHook, act, waitFor } from '@testing-library/react';
import { useGameCardImage } from './useGameCardImage';
import { loadAssetManifest } from '@app/utils/paths';
import { vi } from 'vitest';

vi.mock('@app/utils/paths', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@app/utils/paths')>();
  return {
    ...actual,
    loadAssetManifest: vi.fn(),
  };
});

describe('useGameCardImage', () => {
  const mockManifest = (manifest: any) => {
    vi.mocked(loadAssetManifest).mockResolvedValue(manifest);
  };

  it('uses game-card when manifest declares it and updates load state', async () => {
    mockManifest({
      games: {
        poc: { cardAssets: { gameCard: '/games/poc/icons/game-card.webp' } },
      },
    });

    const { result } = renderHook(() => useGameCardImage('poc'));

    await waitFor(() => {
      expect(result.current.imageSrc).toContain('games/poc/icons/game-card.webp');
    });
    expect(result.current.isGameCardArt).toBe(true);
    expect(result.current.isImageReady).toBe(false);

    act(() => {
      result.current.onImageLoad();
    });

    expect(result.current.isImageReady).toBe(true);
  });

  it('advances to the next source on error', async () => {
    mockManifest({
      games: {
        poc: { cardAssets: { gameCard: '/games/poc/icons/game-card.webp' } },
      },
    });

    const { result } = renderHook(() => useGameCardImage('poc'));

    await waitFor(() => {
      expect(result.current.imageSrc).toContain('games/poc/icons/game-card.webp');
    });
    const initialSrc = result.current.imageSrc;
    act(() => {
      result.current.onImageError();
    });

    expect(result.current.imageSrc).not.toBe(initialSrc);
  });

  it('returns no image when game is missing from manifest', async () => {
    mockManifest({ games: {} });

    const { result } = renderHook(() => useGameCardImage('poc'));

    await waitFor(() => {
      expect(result.current.imageSrc).toBeNull();
    });
    expect(result.current.isGameCardArt).toBe(false);
  });
});
