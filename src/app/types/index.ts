// App-level types and interfaces

export interface BaseTheme {
  bgFrom: string;
  bgVia: string;
  bgTo: string;
  glow: string;
}

// Metadata for a game registered in the app
export interface GameRegistry {
  // Unique game identifier (used for routes/assets)
  id: string;
  // Show this game in the main selector UI
  visible: boolean;
  // Whether game is playable (otherwise "coming soon")
  available: boolean;
  // Title shown in GameSelector
  title: string;
  // Fallback emoji icon for cards/loading
  emoji: string;
  // Optional direct favicon URL for fast first paint.
  favicon?: string;
  // Theme hints for the initial LoadingScreen.
  theme?: BaseTheme;
  // Hide from selector in production, keep routes in dev
  devonly?: boolean;
  // Optional route override (default: `/${id}`)
  route?: string;
}
