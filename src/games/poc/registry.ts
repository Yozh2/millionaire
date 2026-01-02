const getBasePath = (): string => {
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? base : `${base}/`;
};

const withBasePath = (relativePath: string): string => {
  const clean = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  return `${getBasePath()}${clean}`;
};

const theme = {
  bgColor: '#0a1628',
  glowColor: '#6366f1',
  bgPanelFrom: '#0a1628',
  bgHeaderVia: '#4338ca',
};

export const registry = {
  id: 'poc',
  visible: true,
  available: true,
  title: 'PROOF OF CONCEPT',
  emoji: '⚙️',
  favicon: withBasePath('icons/favicon.svg'),
  theme,
} as const;
