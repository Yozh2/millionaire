import { render, screen } from '@testing-library/react';

const hookState = vi.hoisted(() => ({
  games: [
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
      available: true,
      getConfig: async () => ({}),
    },
  ],
  handleSelect: vi.fn(),
}));

vi.mock('./useGameSelectorScreen', () => ({
  useGameSelectorScreen: () => hookState,
}));

import { GameSelectorScreen } from './GameSelectorScreen';

describe('GameSelectorScreen', () => {
  it('renders game cards and footer link', () => {
    render(<GameSelectorScreen />);

    expect(screen.getAllByTestId('game-card').length).toBe(2);
    const link = screen.getByText('GitHub');
    expect(link).toHaveAttribute('href', 'https://github.com/Yozh2/millionaire');
  });
});
