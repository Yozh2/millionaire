import { Component, type ErrorInfo, type ReactNode } from 'react';

import '@app/styles/ErrorBoundary.css';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

function DefaultFallback({ error }: { error: Error | null }) {
  return (
    <div className="error-boundary">
      <div className="error-boundary__panel">
        <div className="error-boundary__icon">⚠️</div>
        <h1 className="error-boundary__title">Что-то пошло не так</h1>
        <p className="error-boundary__message">
          Произошла непредвиденная ошибка. Попробуйте перезагрузить страницу.
        </p>
        {error && (
          <details className="error-boundary__details">
            <summary className="error-boundary__summary">
              Техническая информация
            </summary>
            <pre className="error-boundary__stack">{error.message}</pre>
          </details>
        )}
        <button
          onClick={() => window.location.reload()}
          className="error-boundary__button"
        >
          Перезагрузить
        </button>
      </div>
    </div>
  );
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <DefaultFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
