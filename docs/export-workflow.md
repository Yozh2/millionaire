# Export workflow

Этот документ описывает standalone game builds, offline hub bundles, Docker
images и portable desktop artifacts.

## Форматы

- `offline-game` — один `game` + `engine`, без hub и других игр.
- `offline-bundle` — `hub` + выбранный набор игр + `engine`.
- `desktop-game` — standalone game dist, упакованный в portable Electron
  artifact для текущей платформы.

Все форматы используют static assets. Docker-варианты работают без внешнего
домена или VPS.

## Команды

```bash
npm run build:game -- --game nnr --out dist/games/nnr
npm run build:bundle -- --games nnr,poc --out dist/bundles/nnr-poc
npm run package:desktop:game -- --game nnr
npm run package:desktop:nnr
npm run docker:game -- --game nnr --out dist/games/nnr
npm run docker:bundle -- --games nnr,poc --out dist/bundles/nnr-poc
```

`build:game` собирает только выбранную игру и её ассеты. `build:bundle`
собирает hub и выбранные игры.

Во время staging и post-build cleanup из `dist` удаляются macOS `.DS_Store`
файлы, а bundle assertions падают, если они всё же попали в артефакты.

Docker-команды используют тот же static pipeline, а затем упаковывают dist в
nginx image.

Desktop-команды сначала используют single-game pipeline, затем упаковывают
результат в Electron portable artifact для текущей платформы: macOS `.zip` с
`.app`, Windows portable `.exe` или Linux `.AppImage`. По умолчанию desktop
артефакты пишутся в `.build/desktop-packages/<gameId>/`, чтобы обычный
`npm run build` не удалял их при очистке `dist`.

Для cross-build можно явно указать platform/arch:

```bash
npm run package:desktop:game -- --game nnr --platform darwin --arch arm64
npm run package:desktop:game -- --game nnr --platform win32 --arch x64 --skip-build
npm run package:desktop:game -- --game nnr --platform linux --arch x64 --skip-build
```

`--skip-build` переиспользует уже собранный `.build/desktop/<gameId>` и нужен,
когда один и тот же game dist пакуется в несколько desktop targets подряд.

## Правила offline export

- Для одиночной игры использовать `build:game`, не `build`.
- Для выбранного набора игр использовать `build:bundle -- --games a,b`.
- В bundle catalog должен содержать только выбранные игры.
- `asset-manifest.json` в dist должен содержать только выбранные игры.
- Browser smoke должен проверять не только HTML, но и реальные asset fetch-и.

## Smoke запущенных контейнеров

```bash
docker run -d --name millionaire-game-nnr-test -p 18081:80 millionaire-game-nnr:local
docker run -d --name millionaire-bundle-nnr-poc-test -p 18082:80 millionaire-bundle-nnr-poc:local
npm run verify:offline -- --game-url http://127.0.0.1:18081/ --bundle-url http://127.0.0.1:18082/ --game nnr --bundle-games nnr,poc
```

## Проверки

Для изменений export pipeline запускай минимум:

```bash
npm run typecheck
npm test
npm run lint
npm run build
```

Затем добавляй целевую команду export и smoke для изменённого формата.
