# Repository Styleguide

This document defines the shared code style rules for the project.
The goal is to reduce naming drift, speed up reviews, and lower cognitive load
when moving between app/engine layers.

## 1. Naming and casing

### 1.1 Identifiers

- `camelCase` (lowerCamel, mixedCase): variables, functions, parameters, fields.
  - Examples: `gameId`, `buildGameEntries`, `handleClick`.
- `PascalCase` (UpperCamel): React components, classes, types, interfaces, enums.
  - Examples: `LoadingScreen`, `GameRegistryEntry`, `GameCardFsmState`.
- `SCREAMING_SNAKE_CASE`: true constants (immutable shared parameters/configs).
  - Examples: `DEFAULT_LOGO_URL`, `SPRING_K`.
- Booleans: use `is/has/can/should` prefixes.
  - Examples: `isLoading`, `hasError`, `shouldShowLoading`.
- Handlers: `handleX` for functions and `onX` for props.
  - Examples: `handleSubmit`, `onPointerDown`.

Important: `const` alone does not require `SCREAMING_SNAKE_CASE`.
If it is a local variable with regular lifetime, use `camelCase`.

### 1.2 File names

- React components, screens, pages: `PascalCase.tsx`.
  - Examples: `LoadingScreen.tsx`, `GameSelectorScreen.tsx`.
- Hooks: `useX.ts` or `useX.tsx`.
  - Examples: `useFavicon.ts`, `useGameCardFsm.ts`.
- Logic without JSX: `camelCase.ts`.
  - Examples: `loadingScreenLogic.ts`, `gameRegistry.ts`.
- Tests: file name + `.test.ts`/`.test.tsx`.
  - Examples: `LoadingScreen.test.tsx`, `gameRegistry.test.ts`.
- Barrels: `index.ts`.

### 1.3 Directories and game ids

- Directories: `kebab-case` for multi-word names.
  - Examples: `sky-cotl`, `game-selector`.
- `gameId` and `routePath`: `kebab-case`.

## 2. Architecture and layers

- `src/app` is UI and user interaction.
- `src/engine` is engine, game logic, and infrastructure.
- `app` can import `engine`, but not the other way around.
- Separate rendering and logic:
  - `Component.tsx` owns JSX/DOM.
  - Logic goes to `componentLogic.ts` or `useComponent.ts`.

## 3. Styles

- All styles live in CSS under:
  - `src/app/styles`
  - `src/engine/ui/styles`
- Do not keep `.css` files next to components/screens; import from `styles`.
- Global styles and aggregation: `src/app/styles/index.css`, `src/engine/ui/styles/Engine.css`.
- CSS file name matches component/screen/module.
  - Example: `src/app/styles/LoadingScreen.css`.
- Class naming: `kebab-case` with BEM-ish structure.
  - Example: `.loading-screen__ring`, `.game-selector__title`.
- Inline styles only for dynamic values (CSS variables/numbers).

## 4. TypeScript

- Use `type` by default.
- Use `interface` for public contracts and extension (`extends`).
- Avoid `any`. If you must use it, add a short explanation comment.
- For static configs, prefer `readonly` and literal types.

## 5. Imports

- Global aliases (for paths above the current directory):
  - `@app` → `/src/app`
  - `@pages` → `/src/pages`
  - `@engine` → `/src/engine`
  - `@games` → `/src/games`
  - `@public` → `/public`
- Order: external packages → internal aliases → relative paths.
- Import types via `import type`.
- Relative imports only from current or child directories (`./`, `./foo/bar`).
- Imports from parent directories (`../`) are forbidden; use aliases.
- Same rule for CSS `@import`.

## 6. Exports

- Prefer named exports.
- `default export` is allowed for lazily loaded pages/screens.

## 7. Tests

- Tests live next to code.
- A separate `tests/` folder is allowed only for e2e/integration scenarios.
- Use Vitest + Testing Library.
- Test behavior and user flows, not internal implementation details.
- Always run tests for any change.
- If tests fail or errors appear, fix them immediately.

## 8. Comments and documentation

- Comments explain "why", not "what".
- Public APIs and non-obvious logic should have a short explanation.
- Every exported/globally important element (constant, function, type, class)
  must have a comment.
- Every function and constant must have a comment.
- All comments must be in English.
- Use `/** ... */` for documentation comments (components/hooks/functions),
  especially in TSX/JSX files.
- Use `//` for short inline notes.

## 9. Formatting and lint

- Format with `npm run format`.
- Code checks: `npm run lint` and `npm run test`.
- Changes must include a test run.
