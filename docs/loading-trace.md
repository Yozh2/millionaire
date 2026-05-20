# Loading trace

Этот документ описывает воспроизводимую проверку waterfall загрузки и текущие
выводы по производительности. Фактическая стратегия загрузки ассетов описана
в `docs/asset-loading-strategy.md`.

## Команда

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

## Артефакты

- `summary.md` — компактный отчёт: buckets, slowest/largest requests,
  loading trace events и ошибки.
- `trace.json` — machine-readable network entries и события приложения.
- `network.har` — HAR без тела ответов.
- `final.png` — финальный скриншот сценария.

## События приложения

- `loading-phase:*` — фазы `boot`, `app`, `engine`, `assets`.
- `game-config:*` и `engine-chunk:*` — загрузка config и engine chunk.
- `asset-manifest:*`.
- `asset-level:*` для `level1`, `level1_1`, `level2`.
- `asset:*` для отдельных ассетов.
- `header-manifest:*` и `header-images:*`.
- `file-exists:*` для динамических проверок файлов.

## Текущий вывод

Первый production trace для `transformers` на `slow-3g` показал, что текущая
стратегия блокирует UX крупными музыкальными файлами:

- `level1` завершается примерно на 105 секунде, основной блокер —
  `games/transformers/music/menu.m4a` около 3.2 MB;
- `level1_1` для кампании `megatron` завершается примерно на 184 секунде,
  основной блокер — `games/transformers/music/Megatron.m4a` около 3.2 MB;
- стартовые изображения и campaign icons заметны, но вторичны по сравнению с
  полной загрузкой музыки до показа UI.

Практический вывод для следующей оптимизации: музыка не должна блокировать
показ StartScreen или переход в gameplay. Её нужно переводить в streaming или
background preload, оставляя blocking preload только для минимальных
изображений и SFX, без которых первый экран или первый клик заметно
деградируют.
