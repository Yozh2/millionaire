import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

const ThrowingChild = () => {
  throw new Error('Boom');
};

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>ok</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('ok')).toBeInTheDocument();
  });

  it('renders fallback UI and calls onError', () => {
    const onError = vi.fn();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary onError={onError}>
        <ThrowingChild />
      </ErrorBoundary>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(onError).toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});
