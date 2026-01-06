import { Suspense, lazy, useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from '@app/components/ErrorBoundary';
import { LoadingOverlay } from '@app/screens/loading/LoadingOverlay';
import { LoadingProvider, useLoading } from '@app/screens/loading/LoadingOrchestrator';

function AppRoutesLoader() {
  const { trackPhase } = useLoading();

  const AppRoutes = useMemo(
    () =>
      lazy(() =>
        trackPhase('app', () => import('@app/App'))
      ),
    [trackPhase]
  );

  return (
    <Suspense fallback={null}>
      <AppRoutes />
    </Suspense>
  );
}

export function AppShell() {
  return (
    <LoadingProvider>
      <ErrorBoundary>
        <BrowserRouter basename="/millionaire">
          <LoadingOverlay />
          <AppRoutesLoader />
        </BrowserRouter>
      </ErrorBoundary>
    </LoadingProvider>
  );
}

export default AppShell;
