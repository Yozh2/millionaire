import { renderHook, act, waitFor } from '@testing-library/react';

const navigateMock = vi.hoisted(() => vi.fn());
const selectorEntries = vi.hoisted(() => [
  {
    kind: 'game',
    id: 'game-a',
    routePath: '/game-a',
    visible: true,
    title: 'Game A',
    emoji: 'A',
    available: true,
    getConfig: async () => ({}),
  },
  {
    kind: 'game',
    id: 'game-b',
    routePath: '/game-b',
    visible: true,
    title: 'Game B',
    emoji: 'B',
    available: false,
    getConfig: async () => ({}),
  },
]);

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('./gameRegistry', () => ({
  getSelectorEntries: () => selectorEntries,
}));

const loadHook = async () => {
  vi.resetModules();
  const { useGameSelectorScreen } = await import('./useGameSelectorScreen');
  const { LoadingProvider } = await import('@app/screens/loading/LoadingOrchestrator');
  return { useGameSelectorScreen, LoadingProvider };
};

describe('useGameSelectorScreen', () => {
  beforeEach(() => {
    navigateMock.mockClear();
    document
      .querySelectorAll('link[rel="icon"]')
      .forEach((el) => el.remove());
  });

  it('returns selector entries and navigates on available entry', async () => {
    const { useGameSelectorScreen, LoadingProvider } = await loadHook();
    const { result } = renderHook(() => useGameSelectorScreen(), {
      wrapper: ({ children }) => <LoadingProvider>{children}</LoadingProvider>,
    });

    expect(result.current.games).toBe(selectorEntries);

    act(() => {
      result.current.handleSelect(selectorEntries[0]);
    });

    expect(navigateMock).toHaveBeenCalledWith('/game-a');

    navigateMock.mockClear();
    act(() => {
      result.current.handleSelect(selectorEntries[1]);
    });

    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('applies a default emoji favicon on mount', async () => {
    const { useGameSelectorScreen, LoadingProvider } = await loadHook();
    renderHook(() => useGameSelectorScreen(), {
      wrapper: ({ children }) => <LoadingProvider>{children}</LoadingProvider>,
    });

    await waitFor(() => {
      const link = document.querySelector('link[rel="icon"]');
      expect(link).not.toBeNull();
      expect(link?.getAttribute('href')?.startsWith('data:image/svg+xml')).toBe(
        true
      );
    });
  });
});
