# Стратегия загрузки ассетов (текущая)

Этот документ описывает текущее, боевое поведение загрузки ассетов
в слоях приложения и движка. Это снимок системы до рефакторинга.

Важно: общие ассеты движка убраны. Директории `/public/icons` и
`/public/images` не используются резолверами и не являются источником
фоллбеков.

## 1) Источники данных

- `public/asset-manifest.json`
  - Генерируется скриптом `scripts/generate-asset-manifest.js`.
  - Используется основной системой прелоада (`AssetLoader`).
  - Содержит ассеты игр и кампаний (движковые ассеты не индексируются).
- `public/**/manifest.json` (манифесты изображений)
  - Генерируются скриптом `scripts/generate-image-manifest.js`.
  - Используются слайд-шоу в шапке (`useHeaderImages`), независимо от
    `asset-manifest.json`.

## 2) Ключевые компоненты

- `src/engine/services/assetLoader.ts`
  - Загрузчик на основе манифеста с уровнями прелоада.
  - Кэширует изображения и аудио-буферы, отслеживает загрузенные/упавшие ассеты.
  - Экспортирует `loadLevel`, `preloadInBackground`, `isLevelLoaded` и т.д.
- `src/engine/ui/hooks/useAssetPreloader.ts`
  - React-обертка вокруг `AssetLoader`.
  - Возвращает `{ isLoading, progress, isComplete, error }` + `reload()`.
- `src/engine/utils/assetLoader.ts`
  - Резолвер аудио-путей.
  - Проверяет наличие файла (HEAD / ranged GET), чтобы выбрать:
    game-specific -> oscillator / silence.
  - Используется аудио-плеерами, не связан с манифестным прелоадером.

## 3) Уровни загрузки (AssetLoader)

Смысл уровней описан в `src/engine/services/types.ts` и применяется в
`AssetLoader.getAssetsForLevel`.

### Level 0 (GameSelector)

Предназначен для экрана выбора игры. Сейчас определен в коде, но
активно не запускается приложением.

Загружаемые ассеты:

- Карточки игр: `gameCard`, если есть, иначе `favicon`.

### Level 1 (Игра выбрана -> StartScreen)

Запускается через `useAssetPreloader('level1', gameId)` в `MillionaireGame`.

Загружаемые ассеты:

- Иконки игры.
- Звуки игры.
- Музыка главного меню (если есть).
- Стартовые изображения (общие + стартовые изображения кампаний).

### Level 1.1 (Кампания выбрана)

Запускается при выборе кампании:
`assetLoader.loadLevel('level1_1', gameId, campaignId)` с прогрессом.

Загружаемые ассеты:

- Музыка кампании (если есть).
- Изображения режима easy (кампания).
- Голосовые реплики игры.

### Level 2 (Геймплей)

Запускается при старте игры:
`assetLoader.preloadInBackground('level2', gameId, campaignId)`.

Загружаемые ассеты:

- Музыка конца игры (victory/defeat/retreat) на уровне игры.
- Изображения конца игры (fallback на уровне игры).
- Изображения режима medium/hard (кампания).
- Изображения конца игры (кампания).

## 4) Поведение AssetLoader

- Манифест загружается один раз через `assetLoader.loadManifest()` и кэшируется.
  - Если манифест отсутствует, используется пустой и прелоад пропускается.
- Пути приводятся к абсолютным URL через `getBasePath()`.
- Мета-ассеты (favicon, web manifest) грузятся первыми, чтобы снизить задержки.
- Изображения грузятся через `Image()` и кэшируются в памяти.
- Аудио:
  - Звуковые эффекты (`/sounds/`) грузятся в ArrayBuffer, кэшируются и
    пред-декодируются для низкой задержки.
  - Музыка (`/music/`) прелоадится через `HTMLAudioElement`, но не хранится
    в JS-памяти.
  - Голоса помечаются как загруженные без префетча для экономии памяти.
- Загруженные/упавшие ассеты отслеживаются, чтобы не грузить повторно.
- Завершение уровня фиксируется в `loadedLevels`.

## 5) Резолв аудио с fallback (utils/assetLoader)

Некоторые аудио-потоки не используют манифест и резолвятся динамически:

- `getAssetPaths(type, filename, gameId)` строит:
  - `/games/{gameId}/{type}/{filename}` (game-specific)
- `checkFileExists(url)` делает HEAD, а затем ranged GET (0-0) как fallback.
  - Для аудио путей (`/games/.../sounds|music|voices/`) при наличии
    `asset-manifest.json` использует его как быстрый источник истины,
    чтобы не делать сетевые проверки при отсутствии файлов.
- `resolveAssetPath(...)` выбирает specific -> none.
- Используется в:
  - `src/engine/utils/audioPlayer.ts`
  - `src/engine/audio/useSoundPlayer.ts`
  - `src/engine/audio/useMusicPlayer.ts`
  - `src/engine/audio/resolveCompanionVoice.ts`

## 6) Другие пути загрузки ассетов

- Слайд-шоу хедера (`useHeaderImages`) тянет `manifest.json` только из
  `public/games/{gameId}/images` и работает независимо от AssetLoader.
- Фавиконки управляются хуками `useFavicon` / `useImmediateFavicon`, которые
  обновляют `<link rel="icon">` и связанные meta-теги во время выполнения.
  Для игры используется файл из `public/games/{gameId}/favicon` (если есть);
  иначе favicon генерируется из эмодзи игры из `manifest.ts`.
  Стандартный favicon движка — эмодзи (data URI), без файлового svg-фоллбека.

## 7) Измерение waterfall загрузки

Для воспроизводимой проверки медленной загрузки используется:

```bash
npm run trace:loading -- --game transformers --profile slow-3g
```

Скрипт `scripts/trace-loading.mjs`:

- собирает production build и запускает `vite preview`;
- открывает игру через Playwright/Chromium;
- включает throttling через Chrome DevTools Protocol;
- отключает browser cache;
- проходит сценарий до gameplay;
- пишет артефакты в `.agent/runtime/loading-traces/<timestamp>-<game>-<profile>/`.

Основные артефакты:

- `summary.md` — компактный отчёт: buckets, slowest/largest requests,
  loading trace events и ошибки;
- `trace.json` — машинно-читаемые network entries + события приложения;
- `network.har` — HAR без тела ответов;
- `final.png` — финальный скриншот сценария.

Смысловые события приложения приходят из dev-readable trace sink:

- `loading-phase:*` — фазы `boot`, `app`, `engine`, `assets`;
- `game-config:*` и `engine-chunk:*` — загрузка config и engine chunk;
- `asset-manifest:*`;
- `asset-level:*` для `level1`, `level1_1`, `level2`;
- `asset:*` для отдельных ассетов;
- `header-manifest:*` и `header-images:*`;
- `file-exists:*` для динамических проверок файлов.

Первый production trace для `transformers` на `slow-3g` показал, что текущая
стратегия блокирует UX крупными музыкальными файлами:

- `level1` завершается примерно на 105 секундах, основной блокер —
  `games/transformers/music/menu.m4a` около 3.2 MB;
- `level1_1` для кампании `megatron` завершается примерно на 184 секунде,
  основной блокер — `games/transformers/music/Megatron.m4a` около 3.2 MB;
- стартовые изображения и campaign icons заметны, но вторичны по сравнению с
  полной загрузкой музыки до показа UI.

Практический вывод для следующей оптимизации: музыка не должна блокировать
показ StartScreen или переход в gameplay. Её нужно переводить в streaming /
background preload или в отдельный non-blocking level, оставляя blocking
preload только для минимальных изображений и SFX, без которых первый экран
или первый клик заметно деградируют.
