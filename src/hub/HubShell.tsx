import { Suspense, lazy, useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from '@hub/components/ErrorBoundary';
import { LoadingOverlay } from '@hub/screens/loading/LoadingOverlay';
import {
  LoadingProvider,
  useLoading,
} from '@hub/screens/loading/LoadingOrchestrator';

function HubRoutesLoader() {
  const { trackPhase } = useLoading();

  const HubRoutes = useMemo(
    () => lazy(() => trackPhase('app', () => import('@hub/HubApp'))),
    [trackPhase],
  );

  return (
    <Suspense fallback={null}>
      <HubRoutes />
    </Suspense>
  );
}

export function HubShell() {
  return (
    <LoadingProvider>
      <ErrorBoundary>
        <BrowserRouter basename={__MILLIONAIRE_ROUTER_BASENAME__}>
          <LoadingOverlay />
          <HubRoutesLoader />
        </BrowserRouter>
      </ErrorBoundary>
    </LoadingProvider>
  );
}

export default HubShell;
