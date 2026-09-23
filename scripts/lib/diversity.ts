import { diversityScore } from '../../src/catalog/taxonomy';

export function parseFocus(raw = process.env.INGEST_FOCUS): string[] {
  if (!raw?.trim()) return [];
  return [
    ...new Set(
      raw
        .split(',')
        .map((part) => part.trim().toLowerCase().split('-')[0] ?? '')
        .filter(Boolean),
    ),
  ];
}

export function takeFocused<
  T extends {
    id: string;
    originalLanguage?: string;
    signals?: { popularity: number };
  },
>(buckets: Map<string, T[]>, limit: number, focus: string[]): T[] {
  if (focus.length === 0) return takeDiverse(buckets, limit);

  const diversityShare = Math.max(Math.floor(limit * 0.22), 1500);
  const other = new Map<string, T[]>();
  for (const [language, list] of buckets) {
    if (!focus.includes(language)) other.set(language, list);
  }
  const diverse = takeDiverse(other, diversityShare);
  const seen = new Set(diverse.map((item) => item.id));
  const out = [...diverse];

  const remaining = Math.max(limit - out.length, 0);
  const quotas = focusQuotas(focus, remaining);
  for (const language of focus) {
    const quota = quotas.get(language) ?? 0;
    const ranked = [...(buckets.get(language) ?? [])].sort(
      (a, b) => (b.signals?.popularity ?? 0) - (a.signals?.popularity ?? 0),
    );
    let added = 0;
    for (const item of ranked) {
      if (added >= quota || out.length >= limit) break;
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      out.push(item);
      added += 1;
    }
  }

  if (out.length < limit) {
    const leftovers = [...buckets.values()]
      .flat()
      .sort(
        (a, b) => (b.signals?.popularity ?? 0) - (a.signals?.popularity ?? 0),
      );
    for (const item of leftovers) {
      if (out.length >= limit) break;
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      out.push(item);
    }
  }
  return out;
}

function focusQuotas(focus: string[], remaining: number): Map<string, number> {
  const quotas = new Map<string, number>();
  if (focus.length === 0 || remaining <= 0) return quotas;
  const hasEn = focus.includes('en');
  const hasEs = focus.includes('es');
  if (hasEn && hasEs && focus.length === 2) {
    quotas.set('en', Math.floor(remaining * 0.58));
    quotas.set('es', remaining - (quotas.get('en') ?? 0));
    return quotas;
  }
  const each = Math.floor(remaining / focus.length);
  for (const language of focus) quotas.set(language, each);
  return quotas;
}

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
