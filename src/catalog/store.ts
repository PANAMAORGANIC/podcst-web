import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { SEED_CATALOG } from './seed';
import type { CatalogEntry } from './types';

export const CATALOG_SNAPSHOT_PATH = path.join(
  process.cwd(),
  'data',
  'catalog.json',
);

interface SnapshotFile {
  generatedAt?: string;
  items?: CatalogEntry[];
}

let cache: { mtime: number; items: CatalogEntry[] } | null = null;

export function readIngested(): CatalogEntry[] {
  if (typeof window !== 'undefined') return [];
  if (!existsSync(CATALOG_SNAPSHOT_PATH)) return [];
  const mtime = statSync(CATALOG_SNAPSHOT_PATH).mtimeMs;
  if (cache && cache.mtime === mtime) return cache.items;
  const raw = readFileSync(CATALOG_SNAPSHOT_PATH, 'utf8');
  const parsed = JSON.parse(raw) as SnapshotFile | CatalogEntry[];
  const items = Array.isArray(parsed) ? parsed : (parsed.items ?? []);
  cache = { mtime, items };
  return items;
}

export function getCatalog(): CatalogEntry[] {
  const ingested = readIngested();
  if (ingested.length === 0) return SEED_CATALOG;
  const byId = new Map<string, CatalogEntry>();
  for (const item of ingested) {
    byId.set(item.id, item);
  }
  for (const item of SEED_CATALOG) {
    byId.set(item.id, item);
  }
  return [...byId.values()];
}

export function getEntry(id: string): CatalogEntry | undefined {
  return getCatalog().find((item) => item.id === id);
}

export function catalogStats(items = getCatalog()) {
  const languages = new Set(items.map((item) => item.originalLanguage));
  const regions = new Set(items.map((item) => item.region));
  return {
    titles: items.length,
    languages: languages.size,
    regions: regions.size,
    types: {
      podcast: items.filter((item) => item.type === 'podcast').length,
      audiobook: items.filter((item) => item.type === 'audiobook').length,
      youtube: items.filter((item) => item.type === 'youtube').length,
    },
    ingested: readIngested().length,
  };
}
