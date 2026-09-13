import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { CatalogRail } from '@/catalog/rails';
import {
  loadRuntimeLikedIds,
  loadUserSignals,
  type UserSignals,
} from '@/catalog/signals';
import { getCatalog } from '@/catalog/store';
import type { CatalogEntry } from '@/catalog/types';

export const FOR_YOU_DIR = join(process.cwd(), 'data/for-you');
export const FOR_YOU_SNAPSHOT_PATH = join(FOR_YOU_DIR, 'latest.json');

export type ForYouSnapshot = {
  generatedAt: string;
  learnedAt: string | null;
  dayKey: string;
  sources: string[];
  weights: Record<string, number>;
  ids: string[];
};

export function dayKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function hashMix(input: string): number {
  let hash = 0;
  for (const char of input) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

export function scoreForYouTitle(
  title: CatalogEntry,
  signals: UserSignals,
  likedIds: Set<string>,
): number {
  if (title.type === 'audiobook') return -1;
  let score = 0;
  const weights = signals.weights;
  for (const tag of title.tags) {
    score += weights[tag.toLowerCase()] ?? 0;
  }
  for (const genre of title.genres) {
    score += (weights[genre.toLowerCase()] ?? 0) * 0.7;
  }
  if (title.originalLanguage) {
    score += (weights[title.originalLanguage] ?? 0) * 0.4;
  }
  if (title.originalLanguage === 'en' || title.originalLanguage === 'es') {
    score += 1.4;
  }
  if (likedIds.has(title.id)) score += 6;
  if (title.type === 'youtube') score += 0.8;
  score += Math.min(2.2, Math.log10((title.signals.popularity ?? 0) + 10) / 2);
  return Number(score.toFixed(3));
}

export function rankForYouFrom(
  catalog: CatalogEntry[],
  signals: UserSignals,
  likedIds: string[],
  limit = 36,
  now = new Date(),
): CatalogEntry[] {
  const liked = new Set(likedIds);
  const day = dayKey(now);
  return catalog
    .map((title) => ({
      title,
      score:
        scoreForYouTitle(title, signals, liked) +
        (hashMix(`${title.id}:${day}`) % 17) / 100,
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.title);
}

export function rankForYou(limit = 36, now = new Date()): CatalogEntry[] {
  return rankForYouFrom(
    getCatalog(),
    loadUserSignals(),
    loadRuntimeLikedIds(),
    limit,
    now,
  );
}

export function writeForYouSnapshot(now = new Date()): ForYouSnapshot {
  const signals = loadUserSignals();
  const titles = rankForYou(48, now);
  const snapshot: ForYouSnapshot = {
    generatedAt: now.toISOString(),
    learnedAt: signals.learnedAt,
    dayKey: dayKey(now),
    sources: signals.sources,
    weights: signals.weights,
    ids: titles.map((title) => title.id),
  };
  mkdirSync(FOR_YOU_DIR, { recursive: true });
  writeFileSync(
    FOR_YOU_SNAPSHOT_PATH,
    `${JSON.stringify(snapshot, null, 2)}\n`,
  );
  writeFileSync(
    join(FOR_YOU_DIR, `${snapshot.dayKey}.json`),
    `${JSON.stringify(snapshot, null, 2)}\n`,
  );
  return snapshot;
}

export function loadForYouSnapshot(): ForYouSnapshot | null {
  if (!existsSync(FOR_YOU_SNAPSHOT_PATH)) return null;
  try {
    return JSON.parse(
      readFileSync(FOR_YOU_SNAPSHOT_PATH, 'utf8'),
    ) as ForYouSnapshot;
  } catch {
    return null;
  }
}

export function loadForYouTitles(limit = 36): CatalogEntry[] {
  const snapshot = loadForYouSnapshot();
  const catalog = getCatalog();
  const byId = new Map(catalog.map((title) => [title.id, title]));
  if (snapshot?.ids.length) {
    const fromSnapshot = snapshot.ids
      .map((id) => byId.get(id))
      .filter((title): title is CatalogEntry => Boolean(title));
    if (fromSnapshot.length >= 8) return fromSnapshot.slice(0, limit);
  }
  return rankForYou(limit);
}

export function forYouRail(limit = 8): CatalogRail {
  const signals = loadUserSignals();
  const learned = signals.learnedAt
    ? `Last learned ${signals.learnedAt.slice(0, 10)}.`
    : 'Weights start from owner favorites.';
  return {
    id: 'for-you',
    title: 'For you',
    lede: `Learned from your likes and YouTube signals — not a homepage scrape. ${learned}`,
    items: loadForYouTitles(limit),
  };
}
