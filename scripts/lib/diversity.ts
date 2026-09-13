import { diversityScore } from '../../src/catalog/taxonomy';

export function takeDiverse<
  T extends { id: string; originalLanguage?: string },
>(buckets: Map<string, T[]>, limit: number): T[] {
  const languages = [...buckets.keys()].sort(
    (a, b) => diversityScore(b) - diversityScore(a),
  );
  const seen = new Set<string>();
  const out: T[] = [];
  let index = 0;
  while (out.length < limit) {
    let added = false;
    for (const language of languages) {
      const item = (buckets.get(language) ?? [])[index];
      if (!item || seen.has(item.id)) continue;
      seen.add(item.id);
      out.push(item);
      added = true;
      if (out.length >= limit) break;
    }
    if (!added) break;
    index += 1;
  }
  return out;
}

export function countItems<T>(buckets: Map<string, T[]>): number {
  return [...buckets.values()].reduce((sum, list) => sum + list.length, 0);
}

export function bucketByLanguage<T extends { originalLanguage: string }>(
  items: T[],
): Map<string, T[]> {
  const buckets = new Map<string, T[]>();
  for (const item of items) {
    const list = buckets.get(item.originalLanguage) ?? [];
    list.push(item);
    buckets.set(item.originalLanguage, list);
  }
  return buckets;
}
