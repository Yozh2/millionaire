import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppShell } from '@app/AppShell';
import '@app/styles/index.css';
import '@engine/ui/styles/Engine.css';

const preventDefault = (e: Event) => e.preventDefault();

// Disable context menu + image drag to prevent easy asset copying.
// Allow bypass in dev when holding a modifier (useful for debugging).
if (typeof document !== 'undefined') {
  document.addEventListener(
    'contextmenu',
    (e) => {
      const mouseEvent = e as MouseEvent;
      if (import.meta.env.DEV && (mouseEvent.ctrlKey || mouseEvent.metaKey || mouseEvent.shiftKey)) {
        return;
      }
      e.preventDefault();
    },
    { capture: true }
  );

  document.addEventListener(
    'dragstart',
    (e) => {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === 'IMG' || target?.closest?.('img')) {
        preventDefault(e);
      }
    },
    { capture: true }
  );
}

// Handle GitHub Pages 404 redirect
const redirectPath = sessionStorage.getItem('redirectPath');
if (redirectPath) {
  sessionStorage.removeItem('redirectPath');
  // Remove the base path prefix if present
  const cleanPath = redirectPath.replace(/^\/millionaire/, '');
  if (cleanPath && cleanPath !== '/') {
    window.history.replaceState(null, '', '/millionaire' + cleanPath);
  }
}

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <AppShell />
  </React.StrictMode>
);

const bootLoader = document.getElementById('boot-loader');
if (bootLoader) {
  window.requestAnimationFrame(() => {
    bootLoader.setAttribute('data-state', 'hidden');
    window.setTimeout(() => bootLoader.remove(), 260);
  });
}
