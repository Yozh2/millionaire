import { renderHook, waitFor } from '@testing-library/react';

const buildResponse = (ok: boolean, contentType?: string) =>
  ({
    ok,
    headers: new Headers(
      contentType ? { 'Content-Type': contentType } : undefined
    ),
  }) as Response;

const loadModule = async () => {
  vi.resetModules();
  return await import('./useFavicon');
};

describe('useFavicon hooks', () => {
  beforeEach(() => {
    document
      .querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]')
      .forEach((el) => el.remove());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns default emoji for shared icon', async () => {
    const fetchMock = vi.fn().mockResolvedValue(buildResponse(false));
    vi.stubGlobal('fetch', fetchMock);

    const { resolveSharedIcon } = await loadModule();
    const result = await resolveSharedIcon();
    expect(result.startsWith('data:image/svg+xml')).toBe(true);
  });

  it('resolves a game favicon when available', async () => {
    const fetchMock = vi.fn((url: RequestInfo | URL) => {
      const href = String(url);
      if (href.includes('/games/test/favicon/favicon.svg')) {
        return Promise.resolve(buildResponse(true, 'image/svg+xml'));
      }
      return Promise.resolve(buildResponse(false));
    });
    vi.stubGlobal('fetch', fetchMock);

    const { resolveGameIcon } = await loadModule();
    const result = await resolveGameIcon('test', 'A');
    expect(result).toContain('/games/test/favicon/favicon.svg');
  });

  it('applies an immediate favicon link', async () => {
    const { useImmediateFavicon } = await loadModule();
    renderHook(() => useImmediateFavicon('https://example.com/icon-a.svg'));

    const link = document.querySelector('link[rel="icon"]');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toContain('icon-a.svg');
  });

  it('resolves game icon state via hook', async () => {
    const fetchMock = vi.fn((url: RequestInfo | URL) => {
      const href = String(url);
      if (href.includes('/games/test/favicon/favicon.svg')) {
        return Promise.resolve(buildResponse(true, 'image/svg+xml'));
      }
      return Promise.resolve(buildResponse(false));
    });
    vi.stubGlobal('fetch', fetchMock);

    const { useGameIcon } = await loadModule();
    const { result } = renderHook(() => useGameIcon('test', 'A'));

    await waitFor(() => {
      expect(result.current.iconUrl).toContain('/games/test/favicon/favicon.svg');
    });
    expect(result.current.isEmoji).toBe(false);
  });

  it('updates head tags when useFavicon runs', async () => {
    const fetchMock = vi.fn((url: RequestInfo | URL) => {
      const href = String(url);
      if (href.includes('/games/test/favicon/favicon.svg')) {
        return Promise.resolve(buildResponse(true, 'image/svg+xml'));
      }
      return Promise.resolve(buildResponse(false));
    });
    vi.stubGlobal('fetch', fetchMock);

    const { useFavicon } = await loadModule();
    renderHook(() => useFavicon('test', 'A'));

    await waitFor(() => {
      const link = document.querySelector('link[rel="icon"]');
      expect(link).not.toBeNull();
      expect(link?.getAttribute('href')).toContain('/games/test/favicon/favicon.svg');
    });
  });
});
