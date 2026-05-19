const virtualRootShellId = 'virtual:root-shell';
const resolvedVirtualRootShellId = `\0${virtualRootShellId}`;
const virtualSelectedGameId = 'virtual:selected-game';
const resolvedVirtualSelectedGameId = `\0${virtualSelectedGameId}`;
const virtualGameCatalogId = 'virtual:game-catalog';
const resolvedVirtualGameCatalogId = `\0${virtualGameCatalogId}`;

const renderSelectedCatalog = (gameIds) => {
  const imports = [];
  const manifests = [];
  const configs = [];

  for (const [index, gameId] of gameIds.entries()) {
    const manifestPath = `/src/games/${gameId}/manifest.ts`;
    const configPath = `/src/games/${gameId}/config.ts`;
    imports.push(
      `import * as manifest${index} from ${JSON.stringify(manifestPath)};`,
    );
    manifests.push(`${JSON.stringify(manifestPath)}: manifest${index}`);
    configs.push(
      `${JSON.stringify(configPath)}: () => import(${JSON.stringify(configPath)})`,
    );
  }

  return [
    imports.join('\n'),
    `export const MANIFEST_MODULES = { ${manifests.join(', ')} };`,
    `export const GAME_CONFIG_LOADERS = { ${configs.join(', ')} };`,
  ].join('\n');
};

export const gameTargetPlugin = (target) => ({
  name: 'millionaire-game-target',
  resolveId(id) {
    if (id === virtualRootShellId) return resolvedVirtualRootShellId;
    if (id === virtualSelectedGameId) return resolvedVirtualSelectedGameId;
    if (id === virtualGameCatalogId) return resolvedVirtualGameCatalogId;
    return null;
  },
  load(id) {
    if (id === resolvedVirtualRootShellId) {
      if (target.kind === 'game') {
        return `export { GameApp as RootShell } from '/src/apps/game/GameApp.tsx';`;
      }
      return `export { HubShell as RootShell } from '/src/hub/HubShell.tsx';`;
    }

    if (id === resolvedVirtualSelectedGameId) {
      if (target.kind !== 'game') {
        return `export const loadSelectedGame = async () => { throw new Error('No selected game for hub target.'); };`;
      }
      return [
        `export const selectedGameId = ${JSON.stringify(target.gameId)};`,
        `export const loadSelectedGame = () => import('/src/games/${target.gameId}/index.ts');`,
      ].join('\n');
    }

    if (id === resolvedVirtualGameCatalogId) {
      if (target.kind === 'bundle') {
        return renderSelectedCatalog(target.gameIds);
      }

      return [
        `export const MANIFEST_MODULES = import.meta.glob('/src/games/*/manifest.ts', { eager: true });`,
        `export const GAME_CONFIG_LOADERS = import.meta.glob('/src/games/*/config.ts');`,
      ].join('\n');
    }

    return null;
  },
});
