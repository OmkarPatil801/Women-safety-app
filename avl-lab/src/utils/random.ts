/** Small seedable PRNG (mulberry32) so "random" demos can be reproduced. */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], rand: () => number = Math.random): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** `count` distinct integers in [min, max]. */
export function distinctInts(count: number, min: number, max: number, rand: () => number = Math.random): number[] {
  const pool = new Set<number>();
  const span = max - min + 1;
  const target = Math.min(count, span);
  while (pool.size < target) pool.add(min + Math.floor(rand() * span));
  return [...pool];
}
