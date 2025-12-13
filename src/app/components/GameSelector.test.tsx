import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { GameSelector } from './GameSelector';
import { getSelectorEntries } from '../registry';

vi.mock('../../engine/hooks', () => ({
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
}));

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

    // Available games are listed as cards
    const cards = screen.getAllByText(/Играть →/i);
    const availableGamesCount = getSelectorEntries().filter((e) => e.card.available).length;
    expect(cards.length).toBe(availableGamesCount);
  });
});
