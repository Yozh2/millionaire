const getBasePath = (): string => {
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? base : `${base}/`;
};

const withBasePath = (relativePath: string): string => {
  const clean = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  return `${getBasePath()}${clean}`;
};

const gameFaviconFile = (gameId: string, filename: string): string =>
  withBasePath(`games/${gameId}/favicon/${filename}`);

const theme = {
  bgColor: '#24313b',
  glowColor: '#dc2626',
  bgPanelFrom: '#09090b',
  bgHeaderVia: '#64748b',
};

export const registry = {
  id: 'transformers',
  visible: false,
  available: true,
  title: 'TRANSFORMERS',
  emoji: '🤖',
  favicon: gameFaviconFile('transformers', 'favicon.svg'),
  theme,
} as const;
