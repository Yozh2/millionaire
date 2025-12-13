/**
 * Centralized base-path helpers for assets and routing.
 *
 * `import.meta.env.BASE_URL` is set by Vite (and respects `base` for GitHub Pages).
 */

/** Base URL with trailing slash (e.g. "/millionaire/") */
export const getBasePath = (): string => {
  return import.meta.env.BASE_URL || '/';
};

/** Join a relative path to the base URL (removes leading slashes) */
export const withBasePath = (relativePath: string): string => {
  const clean = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  return `${getBasePath()}${clean}`;
};

