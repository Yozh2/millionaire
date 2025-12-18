# Millionaire Quiz Engine

A reusable “Who Wants to Be a Millionaire?”‑style quiz engine built with React + TypeScript. The engine is content‑agnostic: specific games are implemented as “mods” via `GameConfig`.

- Play: `https://yozh2.github.io/millionaire/`

## Games (current)

Games are registered in `src/app/registry/gameRegistry.ts`.

| Game ID | Title | Language | Notes |
|---|---|---|---|
| `poc` | Proof of Concept | RU | Minimal engine demo (can run with no external assets) |
| `bg3` | Baldur's Gate III | RU |  |
| `sky-cotl` | Sky: Children of the Light | EN |  |
| `transformers` | Transformers (comics) | RU |  |

## Repository layout

- `src/app/**` — app shell (selector UI, registry).
- `src/pages/**` — app pages (routing targets).
- `src/engine/**` — the engine.
- `src/games/**` — game content / mods.
- `scripts/**` — build helpers + sandboxes (not part of runtime).
- `public/**` — optional runtime assets (manifests, images, sounds). The engine itself should not hard‑require this directory.

## Engine architecture (high‑level)

The engine is intentionally split into layers:

- `src/engine/game/**` — pure domain logic (state machine, reducer, selectors, lifelines, prizes, session). No React/DOM.
- `src/engine/ui/**` — React UI (screens, panels, components, layout, theme, styles).
- `src/engine/audio/**` — music + SFX/voice players (with fallbacks and “stop handles”).
- `src/engine/assets/**` + `src/engine/services/AssetLoader.ts` — manifest‑based asset loading; must be resilient when manifests/assets are missing.

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
npm run lint
npm run build
```

## Adding a new game

1. Create a new directory: `src/games/<gameId>/`.
2. Add campaigns:
   - `src/games/<gameId>/campaigns/<campaignId>/campaign.ts`
   - `src/games/<gameId>/campaigns/<campaignId>/questions.ts`
   - `src/games/<gameId>/campaigns/<campaignId>/theme.ts`
3. Add `src/games/<gameId>/config.ts` exporting `<gameId>Config: GameConfig`.
4. Register the game in `src/app/registry/gameRegistry.ts` (card meta + lazy `getConfig()` import).
5. Optional: add `public/` assets (sounds/images) and regenerate manifests.

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

Engine styles are bundled by the engine itself (`src/engine/index.ts` imports `src/engine/ui/styles/engine.css`) and scoped under the `.engine` root class to avoid leaking styles into the host app.

## License

MIT
