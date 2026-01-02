import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoadingIndicator, LoadingScreen } from './LoadingScreen';

describe('LoadingScreen', () => {
  it('renders a logo and falls back to emoji on error', async () => {
    render(
      <LoadingScreen
        progress={25}
        logoUrl="https://example.com/logo.svg"
        logoEmoji="A"
      />
    );

    const img = screen.getByRole('img', { name: 'Loading' });
    fireEvent.error(img);

    await waitFor(() => {
      expect((img as HTMLImageElement).src.startsWith('data:image/svg+xml,')).toBe(
        true
      );
    });
  });
});

describe('LoadingIndicator', () => {
  it('renders three dots and label', () => {
    const { container } = render(<LoadingIndicator text="Loading" />);

    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(container.querySelectorAll('.loading-indicator__dot').length).toBe(3);
  });
});
