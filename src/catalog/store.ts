import { existsSync, statSync } from 'node:fs';
import { SEED_CATALOG } from './seed';
import { CATALOG_GZ_PATH, CATALOG_JSON_PATH, loadSnapshot } from './snapshot';
import type { CatalogEntry } from './types';

export const CATALOG_SNAPSHOT_PATH = CATALOG_JSON_PATH;

let cache: { mtime: number; items: CatalogEntry[] } | null = null;

function snapshotMtime(): number {
  let mtime = 0;
  if (existsSync(CATALOG_GZ_PATH)) {
    mtime = Math.max(mtime, statSync(CATALOG_GZ_PATH).mtimeMs);
  }
  if (existsSync(CATALOG_JSON_PATH)) {
    mtime = Math.max(mtime, statSync(CATALOG_JSON_PATH).mtimeMs);
  }
  return mtime;
}

export function readIngested(): CatalogEntry[] {
  if (typeof window !== 'undefined') return [];
  const mtime = snapshotMtime();
  if (!mtime) return [];
  if (cache && cache.mtime === mtime) return cache.items;
  const items = loadSnapshot();
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
