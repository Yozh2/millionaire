# Структура репозитория

Этот документ описывает назначение каталогов и важных файлов проекта
`millionaire`. Если структура репозитория меняется, этот документ нужно
обновлять в той же задаче.

## Корень

- `README.md` — краткая входная точка: назначение проекта, команды,
  добавление игры, ссылки на документацию.
- `AGENTS.md` — обязательные правила для ИИ-агентов.
- `package.json` — npm scripts, runtime- и dev-зависимости.
- `vite.config.ts` — Vite, React plugin, aliases, base path `/millionaire/`,
  Vitest-конфигурация.
- `tsconfig.json` — TypeScript strict mode и path aliases.
- `vitest.setup.ts` — setup тестовой среды.
- `.gitignore` — локальные, generated и cache-файлы.
- `.githooks/` — versioned git hooks для локального quality gate.
- `.agent/` — локальные рабочие контексты агентов. Каталог не коммитится.

## Документация

- `docs/game-design.md` — подробный диздок: продукт, механики, контентная
  модель, UX, ассеты и критерии качества.
- `docs/workflows.md` — рабочие процессы разработки, документации, UI,
  ассетов и агентских сессий.
- `docs/repository-layout.md` — этот документ.
- `docs/styleguide.md` — стиль TypeScript, React, CSS, импортов, тестов и
  комментариев.
- `docs/asset-loading-strategy.md` — фактическая стратегия загрузки
  манифестов, изображений и аудио.
- `docs/superpowers/plans/` — планы крупных изменений. Это рабочие планы, а
  не автоматическое описание уже реализованного состояния.

## Исходный код

### `src/main.tsx`

Вход React-приложения. Подключает приложение к DOM и содержит глобальные
browser-side ограничения вроде отключения context menu и drag для изображений.

### `src/app/`

Application shell и экран выбора игр.

- `src/app/App.tsx` и `src/app/AppShell.tsx` — верхний shell приложения.
- `src/app/components/` — компоненты shell-уровня: game cards, error
  boundary, card image/FSM hooks.
- `src/app/hooks/` — app-level хуки, включая favicon.
- `src/app/screens/loading/` — loading screen и orchestrator фаз загрузки.
- `src/app/screens/registry/` — текущий каталог игр, registry index,
  selector screen и тесты.
- `src/app/styles/` — CSS shell-уровня.
- `src/app/types/` — типы app/registry-уровня.
- `src/app/utils/` — path helpers и favicon helpers.

Текущий код ещё использует термин `registry`. Планируемое направление —
переход к терминам `hub`, `catalog`, `manifest` и `gameModule`; детали
зафиксированы в `docs/superpowers/plans/`.

### `src/pages/`

Route-level страницы:

- `RegisteredGamePage.tsx` — загрузка выбранной игры по registry entry,
  orchestration фаз и передача `GameConfig` в engine UI.
- `LoadingSandboxPage.tsx` — sandbox loading-сценариев.
- `SandboxPage.tsx` и `EffectsSandboxPage.tsx` — вспомогательные sandbox
  страницы для ассетов и эффектов.
- `index.ts` — barrel export.

### `src/engine/`

Переиспользуемый quiz engine.

- `src/engine/types/` — публичные типы движка и `GameConfig`.
- `src/engine/game/` — чистая игровая логика без React/DOM:
  state machine, reducer, selectors, session, questions, prizes, lifelines.
- `src/engine/ui/` — React UI движка: screens, panels, buttons, cards,
  layout, theme, hooks, effects и scoped CSS.
- `src/engine/audio/` — music, SFX, voice players и audio fallbacks.
- `src/engine/services/` — `AssetLoader`, logger и service types.
- `src/engine/utils/` — helpers для config preprocessing, campaign creation,
  asset path resolving, no-break markup и audio player.
- `src/engine/index.ts` — публичный вход движка и импорт engine styles.

Ключевое правило: engine не должен знать конкретные игры как продуктовые
сущности. Если engine-коду нужен контент, он должен прийти через `GameConfig`
или явно переданный контракт.

### `src/games/`

Конкретные игры и моды к движку.

Типовая структура:

```text
src/games/<gameId>/
  index.ts
  registry.ts
  config.ts
  strings.ts
  icons.tsx
  campaigns/
    <campaignId>/
      questions.ts
      theme.ts
```

`registry.ts` содержит лёгкие metadata для текущего каталога игр.
`config.ts` собирает полный `GameConfig`.
`questions.ts` содержит вопросы кампании.
`theme.ts` задаёт визуальную тему кампании.

Текущие игры:

- `poc`
- `axis`
- `bg3`
- `nnr`
- `sky-cotl`
- `transformers`

### `src/public/`

Внутренние exports, связанные с публичными ассетами. Runtime-файлы лежат не
здесь, а в корневом `public/`.

## Runtime-ассеты

### `public/`

Статические runtime-ассеты, которые копируются Vite и читаются браузером.

- `public/games/<gameId>/` — ассеты конкретной игры: изображения, музыка,
  звуки, голоса, favicon, cards и campaign-specific файлы.
- `public/fonts/` — шрифты.
- `public/asset-manifest.json` — generated manifest для `AssetLoader`.
- `public/**/manifest.json` — generated image manifests для header/slideshow.

Манифесты генерируются npm scripts и не должны редактироваться вручную.

## Скрипты

- `scripts/generate-game-registry.js` — генерирует текущий registry index.
- `scripts/generate-image-manifest.js` — генерирует image manifests.
- `scripts/generate-asset-manifest.js` — генерирует общий asset manifest.
- `scripts/convert-images.js` — конвертирует wallpaper-изображения в `.webp`.
- `scripts/convert_audio_to_m4a.sh` — конвертирует аудио перед build.
- `scripts/prepare-dist.js` — post-build подготовка `dist`.
- `scripts/format-staged.mjs` — форматирует staged-файлы через Prettier и
  возвращает их в git index.
- `scripts/check-format-changed.mjs` — проверяет Prettier-форматирование
  файлов, изменённых относительно upstream или последнего коммита.
- `scripts/install-git-hooks.sh` — подключает `.githooks/` через
  `core.hooksPath`.

## Generated и локальные каталоги

- `node_modules/` — npm-зависимости.
- `dist/` — результат `npm run build`.
- `.vite/` — Vite cache.
- `temp/` — локальные scratch-файлы.
- `.agent/` — локальный агентский контекст.

Эти каталоги не являются источником истины для продукта.
