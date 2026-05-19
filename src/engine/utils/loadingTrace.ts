export type LoadingTracePrimitive = string | number | boolean | null;

export type LoadingTraceDetails = Record<string, LoadingTracePrimitive>;

export interface LoadingTraceEvent {
  name: string;
  at: number;
  details?: LoadingTraceDetails;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __millionaireTraceEvents?: LoadingTraceEvent[];
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __millionaireLoadingTrace?: {
      event: (event: LoadingTraceEvent) => void;
    };
  }
}

/** Return the current monotonic browser timestamp for loading traces. */
export const getTraceTime = (): number => {
  if (typeof performance !== 'undefined') return performance.now();
  return Date.now();
};

/** Emit a dev-readable loading trace event when the trace sink is present. */
export const traceLoading = (
  name: string,
  details?: LoadingTraceDetails,
): void => {
  if (typeof window === 'undefined') return;

  window.__millionaireLoadingTrace?.event({
    name,
    at: getTraceTime(),
    details,
  });
};
