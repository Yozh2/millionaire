import {
  getCatalogEntryById,
  getCatalogEntries,
  getVisibleCatalogEntries,
} from './gameCatalog';

describe('gameCatalog', () => {
  it('returns selector entries that are visible and not dev-only', () => {
    const selectorEntries = getVisibleCatalogEntries();
    expect(selectorEntries.length).toBeGreaterThan(0);
    expect(
      selectorEntries.every((entry) => entry.visible && !entry.devOnly),
    ).toBe(true);
  });

  it('returns undefined for unknown game id', () => {
    expect(getCatalogEntryById('missing-game-id')).toBeUndefined();
  });

  it('returns game entries with required fields', () => {
    const entries = getCatalogEntries();
    expect(entries.length).toBeGreaterThan(0);
    entries.forEach((entry) => {
      expect(entry.id.length).toBeGreaterThan(0);
      expect(entry.routePath.length).toBeGreaterThan(0);
      expect(entry.title.length).toBeGreaterThan(0);
    });
  });
});
