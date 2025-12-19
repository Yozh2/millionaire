import { useEffect, useState } from 'react';

export function usePortalTunerUi() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const devWindow = window as typeof window & {
      tune_portal?: () => string;
    };

    devWindow.tune_portal = () => {
      setEnabled(true);
      return 'Portal tuner enabled';
    };

    return () => {
      delete devWindow.tune_portal;
    };
  }, []);

  return enabled;
}

export default usePortalTunerUi;
