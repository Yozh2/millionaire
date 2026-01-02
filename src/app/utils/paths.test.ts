import { getBasePath, withBasePath } from './paths';

describe('paths utils', () => {
  it('returns a base path with trailing slash', () => {
    const base = getBasePath();
    expect(base.endsWith('/')).toBe(true);
  });

  it('builds full paths from relative paths', () => {
    const base = getBasePath();
    expect(withBasePath('icons/favicon.svg')).toBe(`${base}icons/favicon.svg`);
    expect(withBasePath('/icons/favicon.svg')).toBe(`${base}icons/favicon.svg`);
  });
});
