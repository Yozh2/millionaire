import type { GameModule } from '@engine/types';

const gameModules = import.meta.glob('/src/games/*/index.ts', {
  eager: true,
}) as Record<string, { default: GameModule }>;

const manifestSources = import.meta.glob('/src/games/*/manifest.ts', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const extractGameId = (path: string): string => {
  const match = path.match(/\/src\/games\/([^/]+)\//);
  if (!match) throw new Error(`Invalid game module path: ${path}`);
  return match[1];
};

describe('game modules', () => {
  it('exports a module matching its directory id', async () => {
    expect(Object.keys(gameModules).length).toBeGreaterThan(0);

    for (const [path, module] of Object.entries(gameModules)) {
      const id = extractGameId(path);
      const gameModule = module.default;

      expect(gameModule.id).toBe(id);
      expect(gameModule.info.id).toBe(id);

      const config = await gameModule.loadConfig();
      expect(config.id).toBe(id);
    }
  });

  it('keeps manifests lightweight', () => {
    expect(Object.keys(manifestSources).length).toBeGreaterThan(0);

    for (const source of Object.values(manifestSources)) {
      expect(source).not.toMatch(/from ['"].\/config['"]/);
      expect(source).not.toMatch(/from ['"].\/icons['"]/);
      expect(source).not.toMatch(/from ['"].\/strings['"]/);
      expect(source).not.toMatch(/from ['"].\/campaigns\//);
    }
  });
});
