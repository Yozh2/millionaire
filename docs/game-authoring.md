# Game authoring

Этот документ описывает, как добавлять и поддерживать игры, кампании,
вопросы, темы и game-specific ассеты. Продуктовые правила механик описаны в
`docs/game-design.md`.

## Структура игры

Типовая структура:

```text
src/games/<gameId>/
  index.ts
  manifest.ts
  config.ts
  strings.ts
  icons.tsx
  campaigns/
    <campaignId>/
      questions.ts
      theme.ts
```

- `manifest.ts` содержит лёгкие метаданные для hub catalog.
- `config.ts` собирает полный `GameConfig`.
- `index.ts` экспортирует `gameModule`.
- `questions.ts` содержит вопросы кампании.
- `theme.ts` задаёт визуальную тему кампании.

`GameConfig` — главный контракт между content-модом и engine. Engine не
должен импортировать конкретную игру напрямую ради доступа к вопросам или
ассетам.

## Добавление игры

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

## Кампании

Кампания — тематический набор вопросов внутри игры. Она может задавать:

- `campaignId`;
- отображаемое название;
- тему;
- пул вопросов;
- изображения для start/play/end состояний;
- campaign-specific music.

Кампании позволяют одной игре иметь несколько маршрутов прохождения:
например разные персонажи, уровни сложности, сюжетные арки или тематические
наборы.

`GameConfig.defaultCampaignId` может задавать кампанию, чья тема используется
на стартовом экране до выбора кампании; сам выбор кампании остаётся
пользовательским действием.

## Вопросы

Вопрос — атомарная единица прохождения.

Ожидаемые свойства вопроса:

- текст вопроса;
- варианты ответов;
- правильный ответ;
- сложность или принадлежность к пулу кампании;
- optional explanation или metadata, если конкретная игра это поддерживает.

Вопросы должны быть детерминированно пригодны для тестирования. Если
используется перемешивание, оно должно быть локализовано в engine utilities,
а не размазано по UI.

## Темы

`theme.ts` задаёт campaign-level визуальный контракт:

- цвета текста, фона, панелей, кнопок и ответов;
- оформление `lifeline` и `prizeLadder`;
- glow-эффекты;
- optional overrides для отдельных поверхностей вроде panel gradient
  direction, primary action button и campaign card.

Overrides должны оставаться визуальными настройками темы, а не переносить
game-specific поведение в engine UI.

## Ассеты игры

Runtime-ассеты живут в `public/games/<gameId>/`. Движок должен стартовать
даже при отсутствии части ассетов или манифестов.

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

## Текущие игры

- `poc` — минимальная демонстрация возможностей engine.
- `axis` — тематическая игра с отдельной стилистикой и кампаниями.
- `bg3` — игра по Baldur's Gate III.
- `nnr` — игра по нейросетям/курсу NNR.
- `sky-cotl` — игра по Sky: Children of the Light.
- `transformers` — игра по Transformers comics.

Список в README должен обновляться вместе с добавлением или удалением игр.
