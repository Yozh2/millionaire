import { useEffect } from 'react';
import { useLoading, useLoadingPhase } from '@app/screens/loading/LoadingOrchestrator';

const LOOP_DURATION_MS = 12000;
const MAX_PROGRESS = 0.95;

export default function LoadingSandboxPage() {
  const { setAppearance } = useLoading();
  const { setProgress, setEnabled, start, reset } = useLoadingPhase('assets');

  useEffect(() => {
    setAppearance({
      theme: undefined,
      logoUrl: undefined,
      logoEmoji: undefined,
    });
  }, [setAppearance]);

  useEffect(() => {
    setEnabled(true);
    start();

    return () => {
      reset();
      setEnabled(false);
    };
  }, [reset, setEnabled, start]);

  useEffect(() => {
    let frameId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - start) % LOOP_DURATION_MS;
      setProgress((elapsed / LOOP_DURATION_MS) * MAX_PROGRESS);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [setProgress]);

  return <div className="min-h-screen bg-black" />;
}
