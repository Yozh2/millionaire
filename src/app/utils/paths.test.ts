import { getBasePath, withBasePath } from './paths';

describe('paths utils', () => {
  it('returns a base path with trailing slash', () => {
    const base = getBasePath();
    expect(base.endsWith('/')).toBe(true);
  });

  it('builds full paths from relative paths', () => {
    const base = getBasePath();
    expect(withBasePath('games/test/favicon/favicon.svg')).toBe(
      `${base}games/test/favicon/favicon.svg`
    );
    expect(withBasePath('/games/test/favicon/favicon.svg')).toBe(
      `${base}games/test/favicon/favicon.svg`
    );
  });
});
