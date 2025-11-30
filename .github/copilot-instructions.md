# Copilot Instructions for Millionaire Quiz Engine

## Project Overview

A reusable "Who Wants to Be a Millionaire" quiz game engine supporting multiple themed games. Currently features BG3 (Baldur's Gate 3) edition with plans for Transformers and other themes.

## Architecture

**Engine-Game Separation**: The codebase separates reusable engine logic from game-specific content:

```
src/
├── engine/              # Reusable quiz game engine
│   ├── components/      # MillionaireGame, StartScreen, GameScreen, EndScreen
│   ├── hooks/           # useGameState (logic), useAudio (sound management)
│   ├── context/         # ThemeProvider for dynamic theming
│   ├── types/           # GameConfig, Question, Campaign, ThemeColors interfaces
│   └── utils/           # Asset loading with fallback support
├── games/               # Game configurations
│   ├── bg3/             # BG3: config, questions, themes, icons
│   └── default/         # Minimal test game (no external assets)
├── pages/               # Route components (BG3Page, EnginePage)
├── components/          # Shared UI (GameSelector, Panel)
└── App.tsx              # Router with lazy-loaded game pages
```

**Data Flow**: `App.tsx` → `pages/*Page.tsx` → `<MillionaireGame config={gameConfig} />` → engine hooks manage state/audio

## Development Commands

```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Build for production → /dist
npm run deploy   # Build and deploy to GitHub Pages
```

## Creating a New Game

1. Create folder `src/games/{gameId}/` with:
   - `config.ts` - Export `GameConfig` object (see `src/engine/types/index.ts`)
   - `questions.ts` - Questions array per campaign
   - `themes.ts` - `ThemeColors` per campaign
   - `icons.tsx` - SVG icon components

2. Add assets to `public/games/{gameId}/`:
   ```
   public/games/{gameId}/
   ├── music/      # Background music per campaign
   ├── sounds/     # Sound effects (Click.ogg, etc.)
   └── voices/     # Companion voice lines
   ```

3. Create page in `src/pages/{GameId}Page.tsx`
4. Add route in `src/App.tsx`
5. Add card to `src/components/GameSelector.tsx`

## Key Interfaces

```typescript
// Complete game config (src/engine/types/index.ts)
interface GameConfig {
  id: string;                          // Asset path prefix
  title: string; subtitle: string;
  campaigns: Campaign[];               // Difficulty modes
  questions: Record<string, Question[]>;
  companions: Companion[];
  strings: GameStrings;                // All UI text
  lifelines: LifelinesConfig;
  prizes: PrizesConfig;
  audio: AudioConfig;
}

// Question format
interface Question {
  question: string;
  answers: string[];      // Exactly 4 answers
  correct: number;        // Index 0-3
  difficulty: number;     // 1-3 stars
}
```

## Asset Loading (Priority)

1. Game-specific: `/games/{gameId}/sounds/Click.ogg`
2. Shared fallback: `/games/shared/sounds/Click.ogg`
3. Oscillator tone (sounds only)

## Conventions

- **Language**: UI strings in Russian, code/comments in English
- **Types**: All types in `src/engine/types/index.ts`, use barrel exports
- **Styling**: Tailwind CSS with theme-aware classes from `ThemeColors`
- **State**: Game logic in `useGameState` hook, audio in `useAudio` hook
- **Components**: Functional components with JSDoc, props interfaces

## Game States

`GameState = 'start' | 'playing' | 'won' | 'lost' | 'took_money'`

## Theming

Access current theme via `useTheme()` hook. Theme includes ~40 Tailwind class strings for consistent styling across campaigns. Example from `src/games/bg3/themes.ts`:

```typescript
const heroTheme: ThemeColors = {
  primary: 'amber',
  textPrimary: 'text-amber-100',
  bgButton: 'from-amber-600 via-amber-700 to-amber-800',
  // ... (see ThemeColors interface for all properties)
};
```
