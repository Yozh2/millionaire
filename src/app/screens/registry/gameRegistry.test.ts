import { getGameById, getGameEntries, getSelectorEntries } from './gameRegistry';

describe('gameRegistry', () => {
  it('returns selector entries that are visible and not dev-only', () => {
    const selectorEntries = getSelectorEntries();
    expect(selectorEntries.length).toBeGreaterThan(0);
    expect(selectorEntries.every((entry) => entry.visible && !entry.devOnly)).toBe(true);
  });

  it('returns undefined for unknown game id', () => {
    expect(getGameById('missing-game-id')).toBeUndefined();
  });

  it('returns game entries with required fields', () => {
    const entries = getGameEntries();
    expect(entries.length).toBeGreaterThan(0);
    entries.forEach((entry) => {
      expect(entry.id.length).toBeGreaterThan(0);
      expect(entry.routePath.length).toBeGreaterThan(0);
      expect(entry.title.length).toBeGreaterThan(0);
    });
  });
});
