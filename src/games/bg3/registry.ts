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
  bgColor: '#3b2416',
  glowColor: '#fbbf24',
  bgPanelFrom: '#451a03',
  bgHeaderVia: '#92400e',
};

export const registry = {
  id: 'bg3',
  visible: true,
  available: true,
  title: "BALDUR'S GATE III",
  emoji: '⚔️',
  favicon: gameFaviconFile('bg3', 'favicon.svg'),
  theme,
} as const;
