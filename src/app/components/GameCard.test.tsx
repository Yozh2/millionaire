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
      />
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
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('renders a card image placeholder', () => {
    const { container } = render(
      <GameCard
        gameId="poc"
        title="Test Game"
        emoji="T"
        available
      />
    );

    const image = container.querySelector('img');
    expect(image).not.toBeNull();
    expect(image?.getAttribute('data-image-kind')).toBe('art');
  });
});
