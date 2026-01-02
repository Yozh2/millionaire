export const getBasePath = (): string => {
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? base : `${base}/`;
};

export const withBasePath = (relativePath: string): string => {
  const clean = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  return `${getBasePath()}${clean}`;
};
