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
  иначе favicon генерируется из эмодзи игры из `registry`.
  Стандартный favicon движка — эмодзи (data URI), без файлового svg-фоллбека.
