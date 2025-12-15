import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { GameSelector } from './GameSelector';
import { getSelectorEntries } from '../registry';

vi.mock('../../engine', async () => {
  const actual = await vi.importActual<typeof import('../../engine')>('../../engine');
  return {
    ...actual,
    useFavicon: vi.fn(),
    useGameIcon: (_id: string, fallbackEmoji: string) => ({
      iconUrl: null,
      isEmoji: true,
      emoji: fallbackEmoji,
    }),
    useAssetPreloader: () => ({
      isLoading: false,
      progress: 100,
    }),
  };
});

describe('GameSelector', () => {
  it('renders title and available game cards', () => {
    render(
      <MemoryRouter>
        <GameSelector />
      </MemoryRouter>
    );

    expect(
      screen.getByText('🎯 Кто хочет стать миллионером?')
    ).toBeInTheDocument();

    const cards = screen.getAllByTestId('game-card');
    expect(cards.length).toBe(getSelectorEntries().length);
  });
});
