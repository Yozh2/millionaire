# Development workflow

Этот документ описывает порядок разработки кода, проверки, git hooks и
browser smoke. Контент игр и offline export вынесены в отдельные документы.

## Feature или bugfix

1. Прочитать обязательные документы из `AGENTS.md`.
2. Создать агентский локальный контекст.
3. Проверить `git status --short`.
4. Найти существующие паттерны через `rg` и ближайшие тесты.
5. Сформулировать минимальный план в `current-task.md`.
6. Внести scoped-изменения.
7. Обновить документацию, если изменилось поведение или структура.
8. Запустить релевантные проверки.
9. Обновить `current-task.md` и `worklog.md`.

## Проверки

Базовый минимум для изменений кода:

```bash
npm run typecheck
npm test
npm run lint
```

Добавляй `npm run build`, если меняются:

- сборка, Vite-конфигурация или маршрутизация;
- public surface;
- ассеты, манифесты или генераторы;
- offline export или deploy pipeline.

Для проверки перед коммитом:

```bash
npm run quality:commit
```

Для проверки перед push:

```bash
npm run quality:push
```

## Git hooks

Репозиторий хранит versioned hooks в `.githooks/`. После клонирования или
смены локальной копии нужно один раз выполнить:

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

Hooks нельзя обходить через `--no-verify` без явного решения пользователя.

## UI smoke

UI-изменения требуют browser-проверки, потому что проект зависит от
responsive layout, CSS, audio consent и runtime-ассетов.

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

В dev-режиме страница игры автоматически перезагружает вкладку, когда Vite
сообщает об изменениях внутри `src/games/<gameId>/`. Это нужно для game config,
тем и контента кампаний: они загружаются лениво и хранятся в state страницы,
так что обычного module HMR недостаточно, чтобы уже открытая игра увидела
свежий `GameConfig`.
