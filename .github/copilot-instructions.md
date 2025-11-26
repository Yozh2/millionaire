# Copilot Instructions for BG3 Millionaire

## Project Overview

BG3 Millionaire is a "Who Wants to Be a Millionaire" style quiz game themed around Baldur's Gate 3 and Forgotten Realms lore. The application is built as a single-page React application with TypeScript.

## Tech Stack

- **Frontend Framework**: React 18 with functional components and hooks
- **Language**: TypeScript (strict mode enabled)
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3 with custom fantasy-themed design system
- **Deployment**: GitHub Pages via `gh-pages` package

## Development Commands

```bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Build for production (outputs to /dist)
npm run preview  # Preview production build locally
npm run deploy   # Build and deploy to GitHub Pages
```

## Project Structure

```
src/
├── components/
│   ├── icons/          # SVG icon components (TrophyIcon, CoinIcon, etc.)
│   └── ui/             # Reusable UI components (Panel, PanelHeader)
├── context/
│   └── ThemeContext.tsx  # Dynamic theme system based on difficulty mode
├── data/
│   ├── questions.ts    # Quiz questions organized by difficulty
│   └── index.ts        # Prize values and companion names
├── types/
│   └── index.ts        # TypeScript type definitions
├── App.tsx             # Main game component with all game logic
├── main.tsx            # Application entry point
└── index.css           # Global styles and Tailwind imports
```

## Coding Conventions

### TypeScript
- Use strict TypeScript typing
- Define interfaces for component props
- Use union types for game states: `'start' | 'playing' | 'won' | 'lost' | 'took_money'`
- Define difficulty modes as: `'hero' | 'illithid' | 'darkUrge'`

### React Patterns
- Use functional components with hooks (useState, useEffect, useRef)
- Use React Context for theme management (ThemeProvider, useTheme)
- Keep component logic in the component file unless it's reusable
- Use JSDoc comments for documenting component purpose and complex logic

### Styling
- Use Tailwind CSS utility classes
- Dynamic styles based on theme context (amber for hero, purple for illithid, red for dark urge)
- Fantasy/medieval aesthetic with serif fonts and ornate borders
- Responsive design using Tailwind's responsive prefixes (md:, lg:)

### File Organization
- Export components from index.ts barrel files
- Keep related types in `types/index.ts`
- Organize questions by difficulty mode in `data/questions.ts`

## Localization

The application UI is in **Russian**. When adding new text content:
- Keep user-facing strings in Russian
- Use fantasy/RPG terminology consistent with the game theme
- Follow existing patterns for text like:
  - "✦ КВЕСТ ✦" (Quest)
  - "⚔ НАЧАТЬ ПРИКЛЮЧЕНИЕ ⚔" (Start Adventure)
  - Prize values in "золотых" (gold)

## Game Features

### Difficulty Modes
- **Hero (Герой)**: Easy mode - amber/gold theme
- **Illithid (Иллитид)**: Medium mode - purple theme  
- **Dark Urge (Тёмный Позыв)**: Hard mode - red theme

### Lifelines (Подсказки)
- **50:50**: Removes two wrong answers
- **Послание (Phone a Friend)**: Advice from a companion
- **Таверна (Ask the Audience)**: Voting percentages

### Key Game Logic
- 15 questions sorted by difficulty (1-5 stars)
- Guaranteed prize checkpoints at questions 5, 10, and 15
- Background music that changes based on game mode

## Adding New Questions

Questions should follow this format:
```typescript
{
  question: 'Question text in Russian?',
  answers: ['Option A', 'Option B', 'Option C', 'Option D'],
  correct: 0,  // Index of correct answer (0-3)
  difficulty: 3,  // Difficulty rating (1-5)
}
```

## Theme System

The `ThemeContext` provides dynamic styling based on selected mode. Access theme colors via:
```typescript
const theme = useTheme();
// or
const theme = getThemeColors(selectedMode);
```

Theme includes colors for text, borders, backgrounds, glows, and shadows.
