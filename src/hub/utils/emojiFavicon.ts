export const DEFAULT_ENGINE_EMOJI = '🎯';

export const createEmojiFavicon = (emoji: string): string => {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
    `<text y=".9em" font-size="90">${emoji}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};
