# Рабочие процессы

Этот документ описывает канонический порядок работы с репозиторием
`millionaire`: как агентам вести локальный контекст, как менять код и
документацию, как добавлять игры и как проверять результат.

## 1. Агентский workflow

Каждый агент работает в собственной локальной папке:

```text
.agent/
  agents/
    <agent-id>/
      current-task.md
      worklog.md
```

`current-task.md` — краткий живой статус задачи. Минимальная структура:

```markdown
# Текущая задача

## Цель

## Статус

## План

## Touched files

## Риски и допущения
```

`worklog.md` — журнал фактических действий. Туда пишутся только полезные
события: прочитанные документы, важные выводы, принятые решения, выполненные
проверки, обнаруженные ограничения.

Правила:

- `.agent/` не коммитится.
- Каждый агент редактирует только свой каталог.
- Перед правкой нового файла агент сверяется с чужими `Touched files`.
- Если работа передаётся другому агенту, handoff фиксируется в обоих
  `worklog.md`.

## 2. Документационный workflow

Документация в `docs/` — часть продукта. Её нужно обновлять вместе с
изменением поведения.

Обновляй документацию в той же задаче, если меняется:

- архитектура `engine`, `app`, `pages`, `games` или `public`;
- контракт `GameConfig`, `campaign`, `question`, `lifeline`,
  `prizeLadder`, `rewardKind`;
- правила загрузки ассетов, манифестов, аудио или изображений;
- команды запуска, сборки, деплоя или генерации;
- пользовательский flow выбора игры, старта кампании, прохождения вопросов,
  завершения игры или звукового согласия;
- правила добавления новых игр и кампаний;
- структура каталогов.

Канонические документы:

- `README.md` — короткая входная точка и быстрые команды.
- `docs/game-design.md` — подробный диздок продукта и механик.
- `docs/repository-layout.md` — карта каталогов и важных файлов.
- `docs/styleguide.md` — кодовый стиль и соглашения.
- `docs/asset-loading-strategy.md` — фактическая загрузка ассетов.
- `docs/workflows.md` — этот документ.
- `docs/superpowers/plans/` — исполняемые планы крупных изменений.

Если появляется новый канонический документ, добавь его в
`docs/repository-layout.md`. Если он нужен новым разработчикам, добавь ссылку
и в `README.md`.

## 3. Разработка фичи или исправления

1. Прочитать обязательные документы из `AGENTS.md`.
2. Создать агентский локальный контекст.
3. Проверить `git status --short` и не перетирать чужие изменения.
4. Найти существующие паттерны через `rg` и ближайшие тесты.
5. Сформулировать минимальный план в `current-task.md`.
6. Внести scoped-изменения.
7. Обновить документацию, если изменилось поведение или структура.
8. Запустить релевантные проверки.
9. Обновить `current-task.md` и `worklog.md`.

Для кода по умолчанию используются:

```bash
npm run typecheck
npm test
npm run lint
npm run build
```

`npm run build` особенно важен для изменений ассетов, manifest generation,
Vite-конфигурации, маршрутизации и публичного деплоя.

Для offline-экспорта:

```bash
npm run build:game -- --game nnr --out dist/games/nnr
npm run build:bundle -- --games nnr,poc --out dist/bundles/nnr-poc
npm run docker:game -- --game nnr --out dist/games/nnr
npm run docker:bundle -- --games nnr,poc --out dist/bundles/nnr-poc
```

`build:game` собирает только выбранную игру и её ассеты. `build:bundle`
собирает hub и выбранные игры. Docker-команды используют уже тот же pipeline,
а затем упаковывают static dist в nginx image.

Smoke-проверка запущенных offline-контейнеров:

```bash
docker run -d --name millionaire-game-nnr-test -p 18081:80 millionaire-game-nnr:local
docker run -d --name millionaire-bundle-nnr-poc-test -p 18082:80 millionaire-bundle-nnr-poc:local
npm run verify:offline -- --game-url http://127.0.0.1:18081/ --bundle-url http://127.0.0.1:18082/ --game nnr --bundle-games nnr,poc
```

## 4. Git hooks и quality gate

Репозиторий хранит versioned git hooks в `.githooks/`. После клонирования
или смены локальной копии нужно один раз выполнить:

```bash
npm run hooks:install
```

Команда выставляет `core.hooksPath=.githooks` и делает hooks исполняемыми.

### `pre-commit`

Перед коммитом выполняется:

1. `npm run format:staged` — Prettier форматирует только staged-файлы и
   добавляет их обратно в index.
2. `npm run typecheck` — TypeScript проверяет проект без emit.
3. `npm run lint` — ESLint проверяет TypeScript/React-код.
4. `npm test` — Vitest запускает автотесты.

Ручной эквивалент:

```bash
npm run quality:commit
```

### `pre-push`

Перед push выполняется:

1. `git lfs pre-push`, если `git-lfs` установлен.
2. `npm run format:changed` — Prettier проверяет файлы, изменённые
   относительно upstream или последнего коммита.
3. `npm run typecheck`.
4. `npm run lint`.
5. `npm run build`.

`npm run build` также запускает `prebuild`, поэтому тесты остаются частью
push-gate.

Ручной эквивалент:

```bash
npm run quality:push
```

Hooks нельзя обходить через `--no-verify` без явного решения пользователя.

## 5. UI workflow

UI-изменения требуют реальной browser-проверки, потому что проект сильно
зависит от responsive layout, CSS, audio consent и runtime-ассетов.

Минимальный ручной smoke:

1. Запустить `npm run dev`.
2. Открыть локальный URL Vite.
3. Проверить экран выбора игры.
4. Открыть затронутую игру.
5. Пройти выбор кампании.
6. Начать игру и ответить минимум на один вопрос.
7. Проверить один затронутый `lifeline`, если менялись gameplay-сценарии.
8. Проверить end screen, если менялся результат, retreat, defeat или victory.

Если менялись размеры, адаптивность или визуальные состояния, проверяй
минимум desktop и narrow viewport.

## 6. Workflow добавления игры

1. Создать `src/games/<gameId>/`.
2. Добавить `strings.ts`, `config.ts`, `index.ts` и, если нужны,
   `icons.tsx`.
3. Добавить кампании:

```text
src/games/<gameId>/campaigns/<campaignId>/
  questions.ts
  theme.ts
```

4. Добавить лёгкие метаданные в `src/games/<gameId>/manifest.ts`.
5. Экспортировать `gameModule` из `src/games/<gameId>/index.ts`.
6. Добавить ассеты в `public/games/<gameId>/`, если игра зависит от
   изображений, аудио, favicon или game card.
7. Запустить `npm run generate:manifests`.
8. Запустить `npm test`, `npm run lint`, `npm run build`.
9. Обновить `README.md`, `docs/game-design.md` или профильный документ, если
   игра вводит новый режим, механику, ассетный контракт или исключение.

Hub найдёт игру через build-time glob по `src/games/*/manifest.ts`; вручную
добавлять игру в catalog не нужно.

## 7. Workflow изменения ассетов

Runtime-ассеты живут в `public/`. Движок должен стартовать даже при
отсутствии части ассетов или манифестов.

При изменении ассетов:

1. Положить файлы в существующую структуру `public/games/<gameId>/`.
2. Для изображений по возможности использовать `.webp`.
3. Запустить `npm run generate:manifests`.
4. Для wallpaper-изображений при необходимости запустить
   `npm run convert:images -- --dry-run`, затем обычный прогон.
5. Проверить `docs/asset-loading-strategy.md`, если меняется источник,
   fallback или preload level.
6. Запустить `npm run build`.
7. Проверить игру в браузере.

## 8. Offline export workflow

Offline export имеет два формата:

- `offline-game` — один `game` + `engine`, без hub и других игр.
- `offline-bundle` — `hub` + выбранный набор игр + `engine`.

Оба формата используют static assets и могут работать в Docker без внешнего
домена или VPS.

Правила:

- Для одиночной игры использовать `build:game`, не `build`.
- Для выбранного набора игр использовать `build:bundle -- --games a,b`.
- В bundle catalog должен содержать только выбранные игры.
- `asset-manifest.json` в dist должен содержать только выбранные игры.
- Browser smoke должен проверять не только HTML, но и реальные asset fetch-и.

## 9. Workflow крупных архитектурных задач

Крупные задачи оформляются как исполняемые планы в
`docs/superpowers/plans/`.

План должен содержать:

- цель и границы работы;
- текущую архитектуру;
- целевую архитектуру;
- решения по терминологии;
- список задач с чекбоксами;
- ожидаемые файлы;
- проверки после каждого крупного шага;
- явные out-of-scope пункты.

Во время выполнения план обновляется по факту. Нельзя отмечать шаг
завершённым до проверки результата.
