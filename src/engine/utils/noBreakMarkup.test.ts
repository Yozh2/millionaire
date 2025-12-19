import { nbsp } from '../constants';
import { applyNoBreakMarkup, applyNoBreakMarkupDeep } from './noBreakMarkup';

describe('applyNoBreakMarkup', () => {
  it('replaces spaces with NBSP inside braced groups and removes braces', () => {
    expect(applyNoBreakMarkup(`Hello {my friend}`)).toBe(`Hello my${nbsp}friend`);
    expect(applyNoBreakMarkup(`A {b c d} E`)).toBe(`A b${nbsp}c${nbsp}d E`);
  });

  it('preserves simple placeholders like {answer}', () => {
    expect(applyNoBreakMarkup(`I think it is "{answer}".`)).toBe(`I think it is "{answer}".`);
    expect(applyNoBreakMarkup(`#{n}`)).toBe(`#{n}`);
    expect(applyNoBreakMarkup(`Loading {title}…`)).toBe(`Loading {title}…`);
  });

  it('supports nested groups', () => {
    expect(applyNoBreakMarkup(`{Correct answer: {answer}}`)).toBe(
      `Correct${nbsp}answer:${nbsp}{answer}`
    );
  });

  it('leaves unmatched braces untouched', () => {
    expect(applyNoBreakMarkup(`Hello {world`)).toBe(`Hello {world`);
    expect(applyNoBreakMarkup(`Hello world}`)).toBe(`Hello world}`);
  });
});

describe('applyNoBreakMarkupDeep', () => {
  it('applies to all string leaves', () => {
    const value = applyNoBreakMarkupDeep({
      a: 'X {Y Z}',
      b: ['K {L M}', 123, { c: '{Correct answer: {answer}}' }],
    });

    expect(value).toEqual({
      a: `X Y${nbsp}Z`,
      b: [`K L${nbsp}M`, 123, { c: `Correct${nbsp}answer:${nbsp}{answer}` }],
    });
  });
});
