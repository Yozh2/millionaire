# План разделения engine, game и hub

> **Для агентных исполнителей:** ОБЯЗАТЕЛЬНЫЙ НАВЫК: используйте `superpowers:subagent-driven-development` или `superpowers:executing-plans`.

**Ветка:** `engine-game-hub-separation`

**Цель:** разделить проект на `engine`, самостоятельные `game`-модули и `hub`; убрать старый registry-слой; сохранить быстрый старт hub через лёгкие manifests.

---

## Термины

- `engine` — библиотека исполнения викторины. Не знает конкретные игры.
- `game` — самостоятельная реализация игры на базе engine.
- `manifest` — лёгкие метаданные игры для hub catalog.
- `gameModule` — полный export игры для прямого запуска и будущей single-game сборки.
- `hub` — приложение-оркестратор: selector, catalog, loading shell, routes.
- `catalog` — список игр, который hub строит через build-time glob.
- `offline-game` — static dist/image одной игры: `engine + game`, без hub и
  других игр.
- `offline-bundle` — static dist/image hub с выбранным набором игр.

## Правила границ

- `src/engine` не импортирует `src/hub`, `@hub`, `src/games`, `@games`.
- `src/games/*` не импортирует `src/hub` или `@hub`.
- `src/hub` не импортирует конкретные игры руками.
- Hub делает eager glob только по `/src/games/*/manifest.ts`.
- Config выбранной игры грузится lazy через `/src/games/*/config.ts`.
- Campaign globs живут внутри каждой игры: `./campaigns/*/theme.ts` и `./campaigns/*/questions.ts`.

## Сделано

- [x] Создана ветка `engine-game-hub-separation`.
- [x] `src/app` переехал в `src/hub`.
- [x] `src/pages` переехал в `src/hub/pages`.
- [x] `src/hub/screens/registry` переехал в `src/hub/catalog`.
- [x] `gameRegistry.ts` переименован в `gameCatalog.ts`.
- [x] Старые aliases `@app`, `@pages`, `@games` удалены.
- [x] `BaseTheme`, `GameManifest`, `GameModule` живут в `@engine/types`.
- [x] `src/games/*/registry.ts` переименованы в `src/games/*/manifest.ts`.
- [x] Все игры экспортируют `gameModule` из `index.ts`.
- [x] Hub catalog строится из eager `manifest.ts` + lazy `config.ts`.
- [x] `scripts/generate-game-registry.js` и generated `registryIndex.ts` удалены.
- [x] `createCampaignsForGame` удалён.
- [x] Все игры используют local campaign globs.
- [x] Public path helpers переехали в `src/engine/utils/paths.ts`.
- [x] Добавлен `src/games/gameModules.test.ts`.
- [x] Добавлен `scripts/assert-boundaries.js`.

## Осталось

- [x] Добавить `scripts/build-target.js`: парсит `hub`/`game`, `--game`, `--base`, `--out`.
- [x] Добавить Vite plugin `scripts/vite-game-target.js`:
  - `virtual:root-shell` экспортирует только `HubShell` или только `GameApp`;
  - `virtual:selected-game` экспортирует loader только выбранной игры;
  - game build не должен импортировать hub.
- [x] Изменить `src/main.tsx`: рендерить `RootShell` из `virtual:root-shell`.
- [x] Добавить `src/apps/game/GameApp.tsx`: грузит selected `gameModule`, config и `@engine/ui/MillionaireGame`.
- [x] Добавить `src/vite-virtual-modules.d.ts`.
- [x] Добавить `--game` и `--public-dir` в `generate-image-manifest.js` и `generate-asset-manifest.js`.
- [x] Добавить `scripts/stage-public-assets.js`: копирует `404.html`, `fonts`, `games/<id>` в `.build/public-game-<id>`.
- [x] Добавить `scripts/build-game.js`: test -> stage public -> manifests subset -> Vite game build -> prepare dist -> assert dist.
- [x] Добавить `scripts/assert-game-dist.js`: проверяет один game id в manifest/assets/chunks.
- [x] Добавить bundle target: hub catalog через `virtual:game-catalog` видит
      только выбранные игры.
- [x] Добавить `scripts/build-bundle.js` и `scripts/assert-bundle-dist.js`.
- [x] Добавить общий nginx Dockerfile для static offline images.
- [x] Добавить `docker:game` и `docker:bundle`.
- [x] Добавить browser smoke `scripts/verify-offline-containers.js`.
- [x] Проверить запущенные Docker-контейнеры single-game и bundle.

## Проверки

Проходят:

```bash
npm run typecheck
npm test
npm run lint
npm run build
npm run build:hub
npm run assert:boundaries
npm run build:game -- --game poc --out dist/games/poc
npm run build:game -- --game nnr --out dist/games/nnr
npm run build:bundle -- --games nnr,poc --out dist/bundles/nnr-poc
npm run docker:game -- --game nnr --out dist/games/nnr
npm run docker:bundle -- --games nnr,poc --out dist/bundles/nnr-poc
npm run verify:offline -- --game-url http://127.0.0.1:18081/ --bundle-url http://127.0.0.1:18082/ --game nnr --bundle-games nnr,poc
node scripts/assert-game-dist.js --dist dist/games/nnr --game nnr
node scripts/assert-bundle-dist.js --dist dist/bundles/nnr-poc --games nnr,poc
```

## Почему single-game target отдельно

Простой `import.meta.glob('/src/games/*/config.ts')` в `GameApp` сохранит lazy-loading, но Vite всё равно создаст chunks для всех игр. Для настоящей отдельной сборки нужен target-aware virtual module, который сгенерирует import только выбранной игры.

Этот слой реализован через `virtual:selected-game`, поэтому single-game build видит только выбранный `src/games/<id>/index.ts`.

Для bundle применяется тот же принцип через `virtual:game-catalog`: Vite
получает статически сгенерированный catalog только по выбранным `gameId`, а не
общий glob по всем играм.
