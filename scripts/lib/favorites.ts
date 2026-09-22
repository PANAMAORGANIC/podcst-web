import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { normalizeFeedUrl, rssId } from './rss';

export type FavoriteHub =
  | 'anchor'
  | 'soundcloud'
  | 'transistor'
  | 'substack'
  | 'podbean'
  | 'libsyn'
  | 'pacifica'
  | 'rss';

export interface FavoriteShow {
  title: string;
  feedUrl: string;
  appleId?: number;
  language: string;
  hub: FavoriteHub;
  creators?: string[];
  description?: string;
  tags?: string[];
  genres?: string[];
  region?: string;
  country?: string;
  countryCode?: string;
  website?: string;
  relatedTerms?: string[];
  relatedGenreIds?: number[];
}

export interface FavoritePin {
  title: string;
  appleId?: number;
  feedUrl?: string;
  language?: string;
  country?: string;
}

export interface ItunesHubQuery {
  term: string;
  country: string;
  language: string;
  region?: string;
}

export interface FavoritesFile {
  shows: FavoriteShow[];
  pins?: Array<string | FavoritePin>;
  hubs?: {
    pacifica?: {
      itunesQueries?: ItunesHubQuery[];
    };
  };
}

export function favoritesJsonCandidates(root = process.cwd()): string[] {
  return [
    path.join(root, 'data', 'sources', 'favorites.json'),
    path.resolve(root, 'data/sources/favorites.json'),
    path.join(process.cwd(), 'data', 'sources', 'favorites.json'),
    '/app/data/sources/favorites.json',
  ];
}

export function loadFavoritesFile(root = process.cwd()): FavoritesFile {
  for (const file of favoritesJsonCandidates(root)) {
    if (existsSync(file)) {
      return JSON.parse(readFileSync(file, 'utf8')) as FavoritesFile;
    }
  }
  throw new Error(
    `favorites.json not found (cwd=${process.cwd()} root=${root})`,
  );
}

export function loadPinFile(root = process.cwd()): FavoritePin[] {
  const file = path.join(root, 'data', 'sources', 'favorite-pins.json');
  if (!existsSync(file)) return [];
  const raw = JSON.parse(readFileSync(file, 'utf8')) as Array<
    string | FavoritePin
  >;
  return raw.map(normalizePin);
}

export function normalizePin(raw: string | FavoritePin): FavoritePin {
  if (typeof raw === 'string') return { title: raw.trim() };
  return { ...raw, title: raw.title.trim() };
}

export function parsePinnedTitles(
  raw = process.env.FAVORITE_PINS,
  argv = process.argv,
): FavoritePin[] {
  const pins: FavoritePin[] = [];
  if (raw?.trim()) {
    for (const part of raw.split(/\n|\|/)) {
      const title = part.trim();
      if (title) pins.push({ title });
    }
  }
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--pin' && argv[i + 1]) {
      pins.push({ title: argv[i + 1].trim() });
      i += 1;
    }
  }
  return pins;
}

export function collectPins(
  file: FavoritesFile,
  root = process.cwd(),
  env = process.env.FAVORITE_PINS,
  argv = process.argv,
): FavoritePin[] {
  const seen = new Set<string>();
  const out: FavoritePin[] = [];
  for (const pin of [
    ...(file.pins ?? []).map(normalizePin),
    ...loadPinFile(root),
    ...parsePinnedTitles(env, argv),
  ]) {
    const key = pin.title.toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(pin);
  }
  return out;
}

export function favoriteId(show: {
  appleId?: number;
  podcastIndexId?: number;
  feedUrl: string;
}): string {
  if (show.appleId) return `it-${show.appleId}`;
  if (show.podcastIndexId) return `pi-${show.podcastIndexId}`;
  return rssId(show.feedUrl);
}

export function scoreItunesTitle(
  want: string,
  got: string | undefined,
): number {
  const a = foldTitle(want);
  const b = foldTitle(got ?? '');
  if (!a || !b) return 0;
  if (a === b) return 100;
  if (b.startsWith(a) || a.startsWith(b)) return 86;
  if (b.includes(a) || a.includes(b)) return 72;
  const shared = a
    .split(' ')
    .filter((word) => word.length > 2 && b.includes(word));
  if (shared.length >= 2) return 58 + shared.length;
  return 0;
}

export function pickItunesHit<T extends { collectionName?: string }>(
  title: string,
  hits: T[],
): T | undefined {
  let best: { hit: T; score: number } | undefined;
  for (const hit of hits) {
    const score = scoreItunesTitle(title, hit.collectionName);
    if (!best || score > best.score) best = { hit, score };
  }
  return best && best.score >= 58 ? best.hit : undefined;
}

export function foldTitle(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export { normalizeFeedUrl };
