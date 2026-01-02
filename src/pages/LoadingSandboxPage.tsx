import { useEffect, useState } from 'react';
import { LoadingScreen } from '@app/screens/loading/LoadingScreen';

const LOOP_DURATION_MS = 12000;

export default function LoadingSandboxPage() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - start) % LOOP_DURATION_MS;
      setProgress((elapsed / LOOP_DURATION_MS) * 100);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <LoadingScreen
      progress={progress}
    />
  );
}
