import { nbsp } from '@engine/constants';

const SIMPLE_PLACEHOLDER_RE = /^[A-Za-z0-9_]+$/;

/**
 * Converts regular spaces to non‑breaking spaces inside "no-break groups" written
 * as `{like this}` and removes the group braces.
 *
 * - `{answer}` / `{n}` / `{title}` placeholders are preserved (braces stay).
 * - Nested groups are supported: `{Correct answer: {answer}}`.
 */
export function applyNoBreakMarkup(input: string): string {
  if (!input.includes('{') && !input.includes('}')) return input;

  let output = '';
  let index = 0;

  while (index < input.length) {
    const char = input[index];

    if (char !== '{') {
      output += char;
      index += 1;
      continue;
    }

    const group = parseBraceGroup(input, index);
    if (!group) {
      output += char;
      index += 1;
      continue;
    }

    const rawInner = group.inner;

    if (SIMPLE_PLACEHOLDER_RE.test(rawInner)) {
      output += `{${rawInner}}`;
      index = group.endIndex + 1;
      continue;
    }

    const processedInner = applyNoBreakMarkup(rawInner);
    output += processedInner.replace(/ /g, nbsp);
    index = group.endIndex + 1;
  }

  return output;
}

/**
 * Deeply applies {@link applyNoBreakMarkup} to all string leaf values in a
 * JSON-ish structure (objects/arrays).
 */
export function applyNoBreakMarkupDeep<T>(value: T): T {
  return applyNoBreakMarkupDeepInternal(value, new WeakMap()) as T;
}

function applyNoBreakMarkupDeepInternal(
  value: unknown,
  seen: WeakMap<object, unknown>
): unknown {
  if (typeof value === 'string') return applyNoBreakMarkup(value);
  if (value == null) return value;
  if (typeof value !== 'object') return value;

  if (seen.has(value)) return seen.get(value)!;

  if (Array.isArray(value)) {
    const out: unknown[] = new Array(value.length);
    seen.set(value, out);
    for (let i = 0; i < value.length; i++) out[i] = applyNoBreakMarkupDeepInternal(value[i], seen);
    return out;
  }

  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) return value;

  const out: Record<string, unknown> = {};
  seen.set(value, out);
  for (const [key, child] of Object.entries(value)) {
    out[key] = applyNoBreakMarkupDeepInternal(child, seen);
  }
  return out;
}

function parseBraceGroup(
  input: string,
  startIndex: number
): { inner: string; endIndex: number } | null {
  if (input[startIndex] !== '{') return null;

  let depth = 0;
  let index = startIndex;

  while (index < input.length) {
    const char = input[index];

    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;

    if (depth === 0) {
      const inner = input.slice(startIndex + 1, index);
      return { inner, endIndex: index };
    }

    if (depth < 0) return null;
    index += 1;
  }

  return null;
}
