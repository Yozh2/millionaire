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
  bgColor: '#00AAFF',
  glowColor: '#fbbf24',
  bgPanelFrom: 'rgba(255, 255, 255, 0.96)',
  bgHeaderVia: '#fbbf24',
};

export const registry = {
  id: 'sky-cotl',
  visible: true,
  available: true,
  title: 'SKY',
  emoji: '☁️',
  favicon: gameFaviconFile('sky-cotl', 'favicon.svg'),
  theme,
} as const;
