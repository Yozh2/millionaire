# План разделения engine, game и hub

> **Для агентных исполнителей:** ОБЯЗАТЕЛЬНЫЙ НАВЫК: используйте `superpowers:subagent-driven-development` (рекомендуется) или `superpowers:executing-plans`, чтобы выполнять этот план по задачам. Шаги оформлены чекбоксами (`- [ ]`) для отслеживания прогресса.

**Ветка:** `engine-game-hub-separation`

**Цель:** смело разделить проект на `engine`, самостоятельные `game`-модули и `hub`, убрать перегруженный термин `registry`, сохранить автоматическое обнаружение игр через globs и подготовить чистую основу для отдельных сборок игр.

**Архитектура:** `engine` остаётся библиотекой исполнения викторины. Каждая `game` сама описывает свой контент, лёгкие метаданные, кампании и ассеты. `hub` автоматически строит каталог доступных игр из лёгких `manifest.ts`, а тяжёлый config конкретной игры подгружает только при запуске этой игры. Offline images и будущий редактор игр пока не входят в работу.

**Стек:** React 18, Vite 5, TypeScript, Vitest, Vite `import.meta.glob`, статическая сборка.

---

## Решения по терминологии

`poc` — обычная игра. Это proof-of-concept реализация на основе `engine`, но архитектурно она должна жить по тем же правилам, что `nnr`, `transformers`, `bg3`, `axis` и `sky-cotl`.

`registry` больше не использовать как название слоя. Сейчас слово означает две разные вещи: hub-каталог игр и метаданные внутри конкретной игры. Это создаёт лишний шум.

Новая терминология:

- `engine`: библиотека исполнения игры.
- `game`: самостоятельная реализация игры на базе `engine`.
- `gameModule`: полный export игры наружу для game build и прямого запуска.
- `manifest`: метаданные игры для hub и shell одной игры.
- `hub`: приложение-оркестратор игр.
- `catalog`: список игр, доступных hub после build-time discovery.

Имена, которые стоит убрать:

- `src/app/screens/registry` -> `src/hub/catalog`
- `gameRegistry.ts` -> `gameCatalog.ts`
- `GameRegistryEntry` -> `GameCatalogEntry`
- `GAME_REGISTRY` -> `GAME_CATALOG`
- `GAME_REGISTRY_INDEX` -> удалить вместе с generated file
- `registry.ts` внутри игры -> `manifest.ts`
- `GameRegistry` type -> `GameManifest`

## Что сейчас есть в коде

Фактические точки переезда:

- `src/app` уже играет роль hub: selector, loading shell, routes, catalog logic.
- `src/app/screens/registry/gameRegistry.ts` строит список игр из `GAME_CONFIG_MODULES` и `registryIndex.ts`.
- `scripts/generate-game-registry.js` генерирует `src/app/screens/registry/registryIndex.ts`.
- `src/games/*/registry.ts` содержит лёгкие метаданные игры. Идея правильная: hub не должен грузить все `index.ts` целиком ради карточек selector-а. Переименовываем файл, но сохраняем сам принцип отдельного лёгкого manifest.
- `src/app/utils/paths.ts` содержит `GAME_CONFIG_MODULES = import.meta.glob('/src/games/*/config.ts')`.
- `src/engine/utils/createCampaignsForGame.ts` содержит glob по всем играм: `/src/games/*/campaigns/*`.
- В `README.md`, `docs/styleguide.md`, `docs/asset-loading-strategy.md` ещё описан старый `app/registry` язык.

## Целевая структура

Сделать прямой переезд без временного alias-легаси:

```text
src/
  engine/
    index.ts
    types/
    ui/
    game/
    services/
    utils/
  games/
    nnr/
      index.ts
      manifest.ts
      config.ts
      campaigns/
      icons.tsx
      strings.ts
    poc/
      index.ts
      manifest.ts
      config.ts
      campaigns/
  hub/
    HubApp.tsx
    HubShell.tsx
    catalog/
      gameCatalog.ts
      GameSelectorScreen.tsx
      useGameSelectorScreen.ts
    loading/
    components/
    hooks/
    styles/
    utils/
  apps/
    game/
      GameApp.tsx
```

`src/pages` сейчас зависит от hub loading и catalog. Его лучше не оставлять как отдельный верхний слой. Перенести:

- `src/pages/RegisteredGamePage.tsx` -> `src/hub/pages/RegisteredGamePage.tsx`
- `src/pages/LoadingSandboxPage.tsx` -> `src/hub/pages/LoadingSandboxPage.tsx`
- sandbox pages -> `src/hub/pages` или `src/hub/sandbox`

## Контракт build-time manifest и game module

У игры есть два публичных входа:

- `src/games/<id>/manifest.ts` — лёгкий manifest для hub catalog. В нём не должно быть imports из `config.ts`, `icons.tsx`, campaign files или тяжёлых модулей.
- `src/games/<id>/index.ts` — полный `gameModule` для прямого запуска игры и game build. Он может импортировать `manifest`, но config всё равно грузит lazy.

Тип:

```ts
import type { GameConfig } from '@engine/types';

export interface GameManifest {
  id: string;
  visible: boolean;
  available: boolean;
  title: string;
  emoji: string;
  favicon?: string;
  theme?: BaseTheme;
  devOnly?: boolean;
  route?: string;
}

export interface GameModule {
  id: string;
  info: GameManifest;
  loadConfig: () => Promise<GameConfig>;
}
```

Пример `manifest.ts`:

```ts
import type { GameManifest } from '@engine/types';

export const manifest = {
  id: 'nnr',
  visible: true,
  available: true,
  title: 'КУРС NNR',
  emoji: '🧠',
  theme: {
    isLight: false,
    bgFrom: '#041815',
    bgVia: '#063647',
    bgTo: '#02060c',
    glow: '#63D792',
  },
} satisfies GameManifest;
```

Пример `index.ts`:

```ts
import type { GameModule } from '@engine/types';
import { manifest } from './manifest';

export const gameModule = {
  id: manifest.id,
  info: manifest,
  loadConfig: async () => (await import('./config')).default,
} satisfies GameModule;

export default gameModule;
```

После этого `src/games/<id>/registry.ts` удаляется, но его роль не исчезает. Она переезжает в `manifest.ts` с более точным названием.

## Правила зависимостей

Зафиксировать жёстко:

- `src/engine` может импортировать только engine-код и общие platform helpers.
- `src/engine` не импортирует `src/games`, `src/hub`, `@games`, `@hub`.
- `src/games/*` может импортировать `@engine`.
- `src/games/*` не импортирует `@hub`.
- `src/hub` может импортировать `@engine`.
- `src/hub` не импортирует конкретные игры руками.
- `src/hub` получает build-time manifest через build-time catalog glob по `manifest.ts`.
- `src/apps/game` может импортировать `@engine` и выбранную game через virtual module.

## Globs: что оставить

Автоматическое обнаружение игр через glob — правильная идея. Её надо сохранить, но держать в host/build слое.

Разрешённые globs:

```ts
// hub catalog discovery: лёгкая метаданные, можно eager
import.meta.glob('/src/games/*/manifest.ts', { eager: true });
```

```ts
// lazy config discovery: только для запуска выбранной игры
import.meta.glob('/src/games/*/config.ts');
```

```ts
// game-local campaign discovery
import.meta.glob('./campaigns/*/theme.ts', { eager: true });
import.meta.glob('./campaigns/*/questions.ts', { eager: true });
```

Запрещённый glob:

```ts
// внутри engine
import.meta.glob('/src/games/*/campaigns/*/theme.ts');
```

Так hub по-прежнему сам находит игры, но его старт не тянет полные game entrypoints. Engine перестаёт знать файловую структуру проекта.

## Задача 1: создать ветку и зафиксировать план

**Файлы:**

- изменить: `docs/superpowers/plans/2026-05-19-single-game-export-architecture.md`

- [x] **Шаг 1: создать ветку**

Команда выполнена:

```bash
git checkout -b engine-game-hub-separation
```

- [ ] **Шаг 2: сохранить обновлённый план**

План должен отражать новую терминологию, `poc` как обычную игру, замену `registry.ts` на лёгкий `manifest.ts`, сохранение быстрого hub discovery и отсутствие задач по offline images/editor.

## Задача 2: добавить новые типы `GameManifest` и `GameModule`

**Файлы:**

- изменить: `src/engine/types/index.ts`
- изменить: `src/app/types/index.ts` после переезда в `src/hub/types/index.ts`
- тест: `npm run test -- --run`

- [ ] **Шаг 1: перенести `BaseTheme` и game метаданные type**

Сейчас `BaseTheme` и `GameRegistry` живут в `src/app/types/index.ts`. Это плохо для игр: лёгкий manifest каждой игры импортирует типы из app/hub.

Цель:

- `BaseTheme` переезжает в `src/engine/types/index.ts`.
- `GameRegistry` переименовывается в `GameManifest`.
- `GameManifest` живёт в `src/engine/types/index.ts`, потому что это host-facing метаданные игры.

- [ ] **Шаг 2: добавить `GameModule`**

В `src/engine/types/index.ts` добавить:

```ts
export interface GameManifest {
  id: string;
  visible: boolean;
  available: boolean;
  title: string;
  emoji: string;
  favicon?: string;
  theme?: BaseTheme;
  devOnly?: boolean;
  route?: string;
}

export interface GameModule {
  id: string;
  info: GameManifest;
  loadConfig: () => Promise<GameConfig>;
}
```

- [ ] **Шаг 3: обновить импорты типов**

Заменить:

```ts
import type { BaseTheme, GameRegistry } from '@app/types';
```

на:

```ts
import type { BaseTheme, GameManifest } from '@engine/types';
```

## Задача 3: переименовать game descriptors и добавить `gameModule`

**Файлы:**

- изменить: `src/games/axis/index.ts`
- создать: `src/games/axis/manifest.ts`
- изменить: `src/games/bg3/index.ts`
- создать: `src/games/bg3/manifest.ts`
- изменить: `src/games/nnr/index.ts`
- создать: `src/games/nnr/manifest.ts`
- изменить: `src/games/poc/index.ts`
- создать: `src/games/poc/manifest.ts`
- изменить: `src/games/sky-cotl/index.ts`
- создать: `src/games/sky-cotl/manifest.ts`
- изменить: `src/games/transformers/index.ts`
- создать: `src/games/transformers/manifest.ts`
- удалить: `src/games/*/registry.ts` после переноса в `manifest.ts`
- тест: добавить `src/games/gameModules.test.ts`

- [ ] **Шаг 1: перенести метаданные из `registry.ts` в `manifest.ts`**

Каждый `manifest.ts` должен экспортировать:

```ts
export const manifest = {
  id: '<game-id>',
  visible: true,
  available: true,
  title: '<title>',
  emoji: '<emoji>',
  theme: { ... },
} satisfies GameManifest;
```

- [ ] **Шаг 2: добавить/обновить `index.ts`**

Каждый `index.ts` должен экспортировать полный module:

```ts
import type { GameModule } from '@engine/types';
import { manifest } from './manifest';

export const gameModule = {
  id: manifest.id,
  info: manifest,
  loadConfig: async () => (await import('./config')).default,
} satisfies GameModule;

export default gameModule;
```

Hub не должен eager-import-ить эти `index.ts`.

- [ ] **Шаг 3: удалить `registry.ts`**

Удалить все `src/games/*/registry.ts`. Не оставлять re-export файлов.

- [ ] **Шаг 4: добавить тест контрактов**

`src/games/gameModules.test.ts` должен проверять:

- у каждой игры есть default export;
- `gameModule.id` совпадает с именем директории;
- `gameModule.info.id` совпадает с `gameModule.id`;
- `loadConfig()` возвращает config с тем же `id`.
- `manifest.ts` не импортирует `config`, `icons`, `campaigns` или `strings`.

## Задача 4: переименовать `src/app` в `src/hub`

**Файлы:**

- переместить: `src/app/**` -> `src/hub/**`
- изменить: `vite.config.ts`
- изменить: `tsconfig.json`
- изменить: `src/main.tsx`
- изменить: все imports `@app/*`
- изменить: `docs/styleguide.md`
- изменить: `README.md`

- [ ] **Шаг 1: физически переместить директорию**

Выполнить:

```bash
git mv src/app src/hub
```

- [ ] **Шаг 2: заменить alias**

В `vite.config.ts`:

```ts
'@hub': fileURLToPath(new URL('./src/hub', import.meta.url)),
```

Удалить alias `@app`. Не оставлять совместимость.

- [ ] **Шаг 3: заменить imports**

Заменить все `@app/` на `@hub/`.

Проверить:

```bash
rg -n "@app|src/app" src scripts docs README.md vite.config.ts tsconfig.json
```

Ожидаемый результат: нет совпадений, кроме исторических заметок в changelog, если они когда-нибудь появятся.

## Задача 5: переименовать registry-слой в catalog

**Файлы:**

- переместить: `src/hub/screens/registry` -> `src/hub/catalog`
- изменить: exports/imports
- изменить: тесты

- [ ] **Шаг 1: переместить директорию**

```bash
git mv src/hub/screens/registry src/hub/catalog
```

- [ ] **Шаг 2: переименовать файлы и типы**

Переименовать:

- `gameRegistry.ts` -> `gameCatalog.ts`
- `gameRegistry.test.ts` -> `gameCatalog.test.ts`
- `GameRegistryEntry` -> `GameCatalogEntry`
- `GAME_REGISTRY` -> `GAME_CATALOG`
- `getGameEntries` можно оставить или переименовать в `getCatalogEntries`; лучше `getCatalogEntries`.
- `getGameById` -> `getCatalogEntryById`
- `getSelectorEntries` -> `getVisibleCatalogEntries`

- [ ] **Шаг 3: обновить selector imports**

`GameSelectorScreen.tsx` и `useGameSelectorScreen.ts` должны импортировать из `@hub/catalog/gameCatalog`.

## Задача 6: удалить generated registry index

**Файлы:**

- удалить: `scripts/generate-game-registry.js`
- удалить: `src/hub/catalog/registryIndex.ts`
- изменить: `package.json`
- изменить: `scripts/generate-asset-manifest.js`, если там есть ожидания старого registry

- [ ] **Шаг 1: убрать npm scripts**

Удалить:

```json
"generate:registry": "node scripts/generate-game-registry.js"
```

Изменить:

```json
"generate:manifests": "node scripts/generate-image-manifest.js && node scripts/generate-asset-manifest.js"
```

- [ ] **Шаг 2: удалить generated file**

Удалить `src/hub/catalog/registryIndex.ts`. Catalog теперь строится напрямую из eager glob по `manifest.ts`.

## Задача 7: построить hub catalog через glob по `manifest.ts`

**Файлы:**

- изменить: `src/hub/catalog/gameCatalog.ts`
- изменить: `src/hub/catalog/gameCatalog.test.ts`
- изменить: `src/hub/utils/paths.ts`

- [ ] **Шаг 1: заменить generated registry на `MANIFEST_MODULES`**

В `src/hub/utils/paths.ts` или прямо в `gameCatalog.ts` использовать:

```ts
const MANIFEST_MODULES = import.meta.glob('/src/games/*/manifest.ts', {
  eager: true,
}) as Record<string, { manifest: GameManifest }>;
```

Этот glob должен быть eager: selector получает title/theme/emoji синхронно, но не грузит config, questions, icons и campaign modules.

- [ ] **Шаг 2: оставить lazy config loaders**

Для запуска выбранной игры использовать отдельный lazy glob:

```ts
const GAME_CONFIG_LOADERS = import.meta.glob(
  '/src/games/*/config.ts',
) as Record<string, () => Promise<{ default: GameConfig }>>;
```

Это сохраняет текущую хорошую оптимизацию: hub видит все игры, но загружает config только выбранной игры.

- [ ] **Шаг 3: построить catalog**

`gameCatalog.ts` должен:

- пройти по всем найденным `manifest`;
- вычислить `routePath`;
- найти соответствующий lazy config loader;
- отсортировать по title/id;
- отфильтровать `devOnly` только для selector, не для всей доступности.

- [ ] **Шаг 4: сохранить автоматическое обнаружение игр**

Никакого ручного списка игр в hub. Добавление новой директории `src/games/new-game/manifest.ts` и `src/games/new-game/config.ts` должно автоматически появляться в hub после сборки.

## Задача 8: убрать game discovery из engine

**Файлы:**

- изменить: `src/engine/utils/createCampaignsForGame.ts`
- изменить: `src/engine/utils/createCampaignsFromGlobs.ts`
- изменить: `src/games/*/config.ts`

- [ ] **Шаг 1: заменить global glob на local globs в играх**

В каждом `src/games/<id>/config.ts` добавить:

```ts
const themeModules = import.meta.glob('./campaigns/*/theme.ts', {
  eager: true,
});
const questionModules = import.meta.glob('./campaigns/*/questions.ts', {
  eager: true,
});
```

И вызывать:

```ts
createCampaignsFromGlobs({
  gameId: '<id>',
  campaignStrings: strings.campaigns,
  iconsById: { ... },
  themeModules,
  questionModules,
});
```

- [ ] **Шаг 2: удалить или упростить `createCampaignsForGame`**

Удалить `createCampaignsForGame`, если после миграции он становится лишним. Если оставить, он должен принимать готовые modules и не содержать `import.meta.glob('/src/games/*')`.

- [ ] **Шаг 3: проверить**

```bash
rg -n "import\\.meta\\.glob\\('/src/games/\\*/campaigns" src/engine src/games
```

Ожидаемый результат: нет совпадений.

## Задача 9: добавить app shell для одиночной игры

**Файлы:**

- создать: `src/apps/game/GameApp.tsx`
- изменить: `src/main.tsx`
- изменить: `vite.config.ts`
- создать: `scripts/build-target.js`

- [ ] **Шаг 1: build target**

Добавить targets:

```ts
type BuildTarget =
  | { kind: 'hub'; gameIds: 'all'; base: string; outDir: string }
  | { kind: 'game'; gameId: string; base: string; outDir: string };
```

Пока только `hub` и `game`. `offline-game` и `offline-bundle` вернутся отдельной работой.

- [ ] **Шаг 2: `GameApp`**

`GameApp` запускает одну выбранную игру без selector и hub catalog UI:

```tsx
export function GameApp() {
  return <RegisteredGamePage gameId={__MILLIONAIRE_GAME_ID__} />;
}
```

Если `RegisteredGamePage` остаётся в hub, выделить shared host component, например `src/engine/host/RegisteredGameHost.tsx` или `src/apps/game/GameRuntimePage.tsx`, чтобы `GameApp` не импортировал hub.

- [ ] **Шаг 3: выбрать root app**

`src/main.tsx` должен выбирать root по build target:

- `hub` -> `HubShell`;
- `game` -> `GameApp`.

## Задача 10: фильтровать public assets для game build

**Файлы:**

- создать: `scripts/stage-public-assets.js`
- изменить: `scripts/generate-asset-manifest.js`
- изменить: `scripts/generate-image-manifest.js`
- изменить: `vite.config.ts`
- добавить: `.gitignore` entry для `.build/`

- [ ] **Шаг 1: поддержать `--game`**

Manifest scripts должны принимать:

```bash
node scripts/generate-image-manifest.js --game nnr
node scripts/generate-asset-manifest.js --game nnr
```

`poc` тоже должен работать как game id.

- [ ] **Шаг 2: staged public**

Для `--game nnr` создать:

```text
.build/public-game-nnr/
  asset-manifest.json
  404.html
  fonts/
  games/nnr/
```

Никаких чужих `games/*`.

- [ ] **Шаг 3: Vite `publicDir`**

Для `hub` оставить `public`. Для `game` использовать staged directory.

## Задача 11: проверки границ

**Файлы:**

- создать: `scripts/assert-boundaries.js`
- создать: `scripts/assert-game-dist.js`
- изменить: `package.json`

- [ ] **Шаг 1: dependency boundary check**

`scripts/assert-boundaries.js` должен падать, если:

- `src/engine` импортирует `@games`, `../games`, `@hub`, `../hub`;
- `src/games/*` импортирует `@hub` или `../hub`;
- `src/hub` импортирует конкретную игру напрямую, а не через glob catalog;
- `src/hub` eager-import-ит `/src/games/*/index.ts`;
- `src/games/*/manifest.ts` импортирует `config`, `icons`, `campaigns` или `strings`;
- остались imports `@app`.

- [ ] **Шаг 2: no-registry check**

Проверить:

```bash
rg -n "registry|Registry|GAME_REGISTRY|GameRegistry|registryIndex|generate-game-registry" src scripts docs README.md package.json
```

Ожидаемый результат: нет старых доменных употреблений. Слово `registry` допустимо только в стороннем техническом контексте, если такой появится. В игровых manifest-файлах должно быть `manifest`, не `registry`.

- [ ] **Шаг 3: game dist check**

```bash
node scripts/assert-game-dist.js --dist dist/games/nnr --game nnr
```

Проверки:

- `asset-manifest.json.games` содержит только `nnr`;
- `games/nnr` существует;
- чужие `games/*` отсутствуют;
- JS chunks не содержат путей к невыбранным играм.

## Задача 12: обновить документацию

**Файлы:**

- изменить: `README.md`
- изменить: `docs/styleguide.md`
- изменить: `docs/asset-loading-strategy.md`
- создать: `docs/architecture.md`

- [ ] **Шаг 1: README**

Обновить структуру проекта:

```text
src/engine/** — движок викторины
src/games/** — самостоятельные игры
src/hub/** — selector, catalog, hub shell
src/apps/game/** — shell для сборки одной игры
```

- [ ] **Шаг 2: styleguide**

Заменить `app` и `registry` на `hub` и `catalog`.

- [ ] **Шаг 3: asset loading**

Обновить текст: Level 0 assets нужны hub catalog / selector, а game build может включать только одну игру.

## Проверка перед завершением ветки

В конце выполнить:

```bash
npm run test
npm run lint
npm run build:hub
npm run build:game -- --game poc --out dist/games/poc
npm run build:game -- --game nnr --out dist/games/nnr
node scripts/assert-boundaries.js
node scripts/assert-game-dist.js --dist dist/games/nnr --game nnr
rg -n "@app|src/app|registry|Registry|GAME_REGISTRY|GameRegistry|registryIndex|generate-game-registry" src scripts docs README.md package.json vite.config.ts
```

Последний `rg` должен быть пустым или содержать только осознанные внешние термины. Если остаются старые имена в собственном коде, ветку нельзя считать законченной.

## Не входит в эту ветку

- браузерный редактор игр;
- Docker/offline images;
- `offline-bundle`;
- публикация в GitHub Container Registry;
- переход на npm workspaces;
- data-driven формат пользовательских игр.

Эти темы лучше поднимать после того, как `engine/game/hub` станут чистыми и проверяемыми.
