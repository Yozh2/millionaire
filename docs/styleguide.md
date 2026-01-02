# Styleguide репозитория

Этот документ фиксирует единые правила кодстайла для проекта.
Цель — уменьшить разнобой в именовании, ускорить ревью и снизить когнитивную нагрузку при переключении между слоями app/engine.

## 1. Нотация и кейсы

### 1.1 Идентификаторы

- `camelCase` (lowerCamel, mixedCase): переменные, функции, параметры, свойства.
  - Примеры: `gameId`, `buildGameEntries`, `handleClick`.
- `PascalCase` (UpperCamel): React-компоненты, классы, типы, интерфейсы, enum.
  - Примеры: `LoadingScreen`, `GameRegistryEntry`, `GameCardFsmState`.
- `SCREAMING_SNAKE_CASE`: “настоящие” константы (неизменяемые значения,
  используемые как общие параметры/настройки или разделяемые между файлами).
  - Примеры: `DEFAULT_LOGO_URL`, `SPRING_K`.
- Булевые: префиксы `is/has/can/should`.
  - Примеры: `isLoading`, `hasError`, `shouldShowLoading`.
- Обработчики: `handleX` для функций и `onX` для пропсов.
  - Примеры: `handleSubmit`, `onPointerDown`.

> Важно: `const` сам по себе не требует `SCREAMING_SNAKE_CASE`.
> Если это локальная переменная с обычным сроком жизни — используем `camelCase`.

### 1.2 Имена файлов

- React-компоненты, экраны, страницы: `PascalCase.tsx`.
  - Примеры: `LoadingScreen.tsx`, `GameSelectorScreen.tsx`.
- Hooks: `useX.ts` или `useX.tsx`.
  - Примеры: `useFavicon.ts`, `useGameCardFsm.ts`.
- Логика без JSX: `camelCase.ts`.
  - Примеры: `loadingScreenLogic.ts`, `gameRegistry.ts`.
- Тесты: имя файла + `.test.ts`/`.test.tsx`.
  - Примеры: `LoadingScreen.test.tsx`, `gameRegistry.test.ts`.
- Баррели: `index.ts`.

### 1.3 Имена директорий и игровых id

- Директории: `kebab-case` для составных имен.
  - Примеры: `sky-cotl`, `game-selector`.
- `gameId` и `routePath`: `kebab-case`.

## 2. Архитектура и слои

- `src/app` — UI и взаимодействие с пользователем.
- `src/engine` — движок, логика и инфраструктура.
- `app` может импортировать `engine`, но не наоборот.
- Разделяйте рендер и логику:
  - `Component.tsx` отвечает за JSX/DOM.
  - Логику выносите в `componentLogic.ts` или `useComponent.ts`.

## 3. Стили

- Все стили хранятся в CSS и лежат в:
  - `src/app/styles`
  - `src/engine/ui/styles`
- В директориях компонентов/экранов `.css` не держим — только импорт из `styles`.
- Глобальные стили и агрегация: `src/app/styles/index.css`, `src/engine/ui/styles/Engine.css`.
- Имя CSS-файла совпадает с компонентом/экраном/модулем.
  - Пример: `src/app/styles/LoadingScreen.css`.
- Именование классов: `kebab-case` c BEM-подходом.
  - Пример: `.loading-screen__ring`, `.game-selector__title`.
- Инлайновые стили — только для динамических значений (CSS variables/числа).

## 4. TypeScript

- По умолчанию используем `type`.
- `interface` — для публичных контрактов и расширения (extends).
- Избегаем `any`. Если нужно — добавляйте короткий комментарий почему.
- Для статических конфигов — `readonly` и литеральные типы.

## 5. Импорты

- Порядок: внешние пакеты → внутренние алиасы (`@app`, `@engine`, `@games`) →
  относительные пути.
- Типы импортируем через `import type`.
- Если есть алиас — используем его вместо глубоких относительных путей.

## 6. Экспорты

- По умолчанию — именованные экспорты.
- `default export` допускается для страниц/экранов, которые грузятся лениво.

## 7. Тесты

- Тесты лежат рядом с кодом.
- Отдельная папка `tests/` допускается только для e2e/интеграционных сценариев.
- Используем Vitest + Testing Library.
- Проверяем поведение и пользовательские сценарии, а не внутренние детали.

## 8. Комментарии и документация

- Комментарии объясняют “почему”, а не “что”.
- Публичные API и сложные участки сопровождаем кратким пояснением.

## 9. Форматирование и линт

- Форматируем через `npm run format`.
- Проверка кода: `npm run lint` и `npm run test`.
