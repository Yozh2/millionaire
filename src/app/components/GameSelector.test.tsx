import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { GameSelector } from './GameSelector';

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

    // Two available games are listed (poc, bg3)
    const cards = screen.getAllByText(/Играть →/i);
    expect(cards.length).toBe(2);
  });
});
