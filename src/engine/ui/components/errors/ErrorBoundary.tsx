/**
 * Error Boundary Component
 *
 * Catches JavaScript errors in child component tree and displays
 * a fallback UI instead of crashing the whole app.
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../../../services';

interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;
  /** Optional fallback UI to show on error */
  fallback?: ReactNode;
  /** Optional callback when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Default fallback UI shown when an error occurs.
 */
// eslint-disable-next-line react-refresh/only-export-components
function DefaultFallback({ error }: { error: Error | null }) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-6 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold text-red-400 mb-2">
          Что-то пошло не так
        </h1>
        <p className="text-gray-400 mb-4">
          Произошла непредвиденная ошибка. Попробуйте перезагрузить страницу.
        </p>
        {error && (
          <details className="text-left bg-gray-900 rounded p-3 text-sm">
            <summary className="cursor-pointer text-gray-500 hover:text-gray-400">
              Техническая информация
            </summary>
            <pre className="mt-2 text-red-300 overflow-auto text-xs">
              {error.message}
            </pre>
          </details>
        )}
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Перезагрузить
        </button>
      </div>
    </div>
  );
}

/**
 * Error Boundary class component.
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 *
 * With custom fallback:
 * ```tsx
 * <ErrorBoundary fallback={<MyErrorPage />}>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
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
    // Log error
    logger.errorBoundary.error('Caught error:', error, {
      componentStack: errorInfo.componentStack,
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback or default
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <DefaultFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
