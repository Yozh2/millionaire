import { render, screen, fireEvent } from '@testing-library/react';
import { GameCard } from './GameCard';

describe('GameCard', () => {
  it('calls onSelect when available', () => {
    const onSelect = vi.fn();
    render(
      <GameCard
        gameId="poc"
        title="Test Game"
        emoji="T"
        available
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('does not call onSelect when unavailable', () => {
    const onSelect = vi.fn();
    render(
      <GameCard
        gameId="poc"
        title="Test Game"
        emoji="T"
        available={false}
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('renders an emoji fallback when no manifest image is known', () => {
    const { container } = render(
      <GameCard gameId="poc" title="Test Game" emoji="T" available />,
    );

    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('.game-card__emoji')?.textContent).toBe('T');
  });
});
