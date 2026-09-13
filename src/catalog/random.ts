/** Stochastic explore for For You and related rails. Not a directory shuffle. */

export const DEFAULT_EXPLORE_RATE = 0.2;

export type ExploreOptions = {
  exploreRate?: number;
  seed?: string | number;
  neighborhood?: number;
};

export function exploreRate(
  raw: string | undefined = process.env.FOR_YOU_RANDOMNESS,
): number {
  if (raw == null || raw.trim() === '') return DEFAULT_EXPLORE_RATE;
  const value = Number(raw);
  if (!Number.isFinite(value)) return DEFAULT_EXPLORE_RATE;
  return Math.min(1, Math.max(0, value));
}

export function hashSeed(input: string): number {
  let hash = 2166136261;
  for (const char of input) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeRng(seed: string | number): () => number {
  return mulberry32(typeof seed === 'number' ? seed : hashSeed(seed));
}

export function requestExploreSeed(now = Date.now()): string {
  return `${now}:${exploreRate()}`;
}

/**
 * Epsilon-greedy sample from an already-ranked related neighborhood.
 * Explore rate 0 is greedy. Explore picks uniformly inside the list —
 * never from unrelated catalog rows that were not passed in.
 */
export function epsilonGreedySample<T>(
  ranked: T[],
  limit: number,
  rate: number,
  rng: () => number,
): T[] {
  if (limit <= 0 || ranked.length === 0) return [];
  if (rate <= 0 || ranked.length <= limit) return ranked.slice(0, limit);
  const remaining = [...ranked];
  const picked: T[] = [];
  while (picked.length < limit && remaining.length > 0) {
    const explore = remaining.length > 1 && rng() < rate;
    const index = explore ? Math.floor(rng() * remaining.length) : 0;
    picked.push(remaining.splice(index, 1)[0] as T);
  }
  return picked;
}

export function neighborhoodSize(limit: number, override?: number): number {
  if (override && override > 0) return Math.max(limit, override);
  return Math.max(limit * 6, 48);
}
