# Millionaire Quiz Engine

A reusable “Who Wants to Be a Millionaire?”‑style quiz engine built with React + TypeScript. The engine is content‑agnostic: specific games are implemented as “mods” via `GameConfig`.

- Play: `https://yozh2.github.io/millionaire/`

## Games (current)

Games are registered through `src/games/*/registry.ts` and the generated
catalog consumed by `src/app/screens/registry/gameRegistry.ts`.

| Game ID        | Title                      | Language | Notes                                                 |
| -------------- | -------------------------- | -------- | ----------------------------------------------------- |
| `axis`         | AXIS                       | RU       | Themed multi-campaign quiz                            |
| `bg3`          | Baldur's Gate III          | RU       |                                                       |
| `nnr`          | КУРС NNR                   | RU       | Neural-network themed quiz                            |
| `poc`          | Proof of Concept           | RU       | Minimal engine demo (can run with no external assets) |
| `sky-cotl`     | Sky: Children of the Light | EN       |                                                       |
| `transformers` | Transformers (comics)      | RU       |                                                       |

## Repository layout

- `src/app/**` — app shell (selector UI, registry).
- `src/pages/**` — app pages (routing targets).
- `src/engine/**` — the engine.
- `src/games/**` — game content / mods.
- `scripts/**` — build helpers + sandboxes (not part of runtime).
- `public/**` — optional runtime assets (manifests, images, sounds). The engine itself should not hard‑require this directory.

## Documentation

- `AGENTS.md` — required workflow for AI agents working in this repo.
- `docs/workflows.md` — development, documentation, UI, asset, and agent workflows.
- `docs/repository-layout.md` — canonical map of repository directories and important files.
- `docs/game-design.md` — detailed design document for product, mechanics, content model, UX, assets, and quality criteria.
- `docs/styleguide.md` — code style, imports, tests, and comments.
- `docs/asset-loading-strategy.md` — current runtime asset loading behavior.

## Engine architecture (high‑level)

The engine is intentionally split into layers:

- `src/engine/game/**` — pure domain logic (state machine, reducer, selectors, lifelines, prizes, session). No React/DOM.
- `src/engine/ui/**` — React UI (screens, panels, components, layout, theme, styles).
- `src/engine/audio/**` — music + SFX/voice players (with fallbacks and “stop handles”).
- `src/engine/services/AssetLoader.ts` + `src/engine/utils/assetLoader.ts` — manifest‑based asset loading and audio path resolution; must be resilient when manifests/assets are missing.

Terminology used across code/docs:

- `lifeline` — a special ability (not “hint”).
- `prizeLadder` — prize ladder (always this name).
- `rewardKind` — `trophy | money | defeat`.

## Running locally

Prereqs: Node.js + npm.

```bash
npm install
npm run dev
```

Useful commands:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## Git hooks and quality gate

Install the repository hooks once per clone:

```bash
npm run hooks:install
```

The versioned hooks live in `.githooks/`.

- `pre-commit` formats staged files with Prettier, then runs typecheck, ESLint,
  and tests.
- `pre-push` checks formatting for changed files, then runs typecheck, ESLint,
  and production build.

Manual equivalents:

```bash
npm run quality:commit
npm run quality:push
```

## Adding a new game

1. Create a new directory: `src/games/<gameId>/`.
2. Add campaigns:
   - `src/games/<gameId>/campaigns/<campaignId>/questions.ts`
   - `src/games/<gameId>/campaigns/<campaignId>/theme.ts`
3. Add `src/games/<gameId>/config.ts` exporting `<gameId>Config: GameConfig`.
4. Add `src/games/<gameId>/registry.ts` with lightweight card metadata.
5. Export the game from `src/games/<gameId>/index.ts`.
6. Regenerate registry/manifests with `npm run generate:manifests`.
7. Optional: add `public/` assets (sounds/images) and regenerate manifests again.

## Assets and manifests

Manifests are generated on `dev`/`build` via `npm run generate:manifests`:

- `scripts/generate-asset-manifest.js` → `public/asset-manifest.json`
- `scripts/generate-image-manifest.js` → image manifests for slideshows / headers
- `scripts/convert-images.js` → converts `public/images/**` and `public/games/<gameId>/images/**` `.png/.jpg` wallpapers to `.webp` (run: `npm run convert:images -- --dry-run`; macOS: requires `cwebp`, e.g. `brew install webp`)

Design goal: if manifests/assets are missing, the engine should still start (with safe fallbacks where possible).

## UX notes

- Audio autoplay is restricted in browsers. On the first load (per session), the engine shows a “headphones / enable sound?” prompt to obtain a user gesture and let the player choose sound on/off.
- The app disables right‑click context menu and image dragging to make casual asset copying harder.

## Styling

Engine styles are bundled by the engine itself (`src/engine/index.ts` imports `src/engine/ui/styles/Engine.css`) and scoped under the `.engine` root class to avoid leaking styles into the host app.

## Acknowledgements

- Thanks to Denis Shiryaev (Telegram channel "[Denis Sexy IT](https://t.me/denissexy)") for the inspiration and the initial idea. Original source (his StarCraft quiz): [Claude artifact](https://claude.ai/public/artifacts/d13e3506-a0ac-451b-a12b-6265277fd5aa).
- Thanks to Larian Studios, IDW, Skybound, and thatgamecompany (Sky: Children of the Light) for assets; all asset rights belong to their respective owners.
