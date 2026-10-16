import { MAX_ABS_KEY } from '../features/avl';

export type ParsedKey = { ok: true; value: number } | { ok: false; error: string };

/** Turn raw text from an input box into a key, with a helpful message when it is unusable. */
export function parseKeyInput(raw: string): ParsedKey {
  const text = raw.trim();
  if (text === '') return { ok: false, error: 'Please type a number first.' };
  if (!/^[+-]?\d+(\.\d+)?$/.test(text)) return { ok: false, error: `"${text}" is not a number. Use whole numbers like 42 or -7.` };
  const n = Number(text);
  if (!Number.isInteger(n)) return { ok: false, error: 'Only whole numbers (integers) are supported - decimals are not allowed.' };
  if (Math.abs(n) > MAX_ABS_KEY) return { ok: false, error: `That number is too large. Use values between −${MAX_ABS_KEY} and ${MAX_ABS_KEY}.` };
  return { ok: true, value: n === 0 ? 0 : n };
}

/** Parse "10, 20 30" style lists. Returns the valid distinct integers plus any problems. */
export function parseKeyList(raw: string): { keys: number[]; errors: string[] } {
  const keys: number[] = [];
  const errors: string[] = [];
  for (const part of raw.split(/[\s,;]+/).filter(Boolean)) {
    const p = parseKeyInput(part);
    if (!p.ok) errors.push(p.error);
    else if (!keys.includes(p.value)) keys.push(p.value);
  }
  return { keys, errors };
}
