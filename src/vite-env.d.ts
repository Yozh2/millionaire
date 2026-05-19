/// <reference types="vite/client" />

/* eslint-disable @typescript-eslint/naming-convention */

import 'react';

declare global {
  const __MILLIONAIRE_BUILD_TARGET__: 'hub' | 'game' | 'bundle';
  const __MILLIONAIRE_GAME_ID__: string | null;
  const __MILLIONAIRE_ROUTER_BASENAME__: string;
}

declare module 'react' {
  interface ImgHTMLAttributes<T> {
    fetchpriority?: 'high' | 'low' | 'auto';
  }
}
