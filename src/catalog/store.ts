import { existsSync, statSync } from 'node:fs';
import { shouldLoadFullSnapshot } from './memory';
import { SEED_CATALOG } from './seed';
import {
  CATALOG_GZ_PATH,
  CATALOG_JSON_PATH,
  loadSnapshot,
  snapshotFileStats,
} from './snapshot';
import type { CatalogEntry } from './types';

export const CATALOG_SNAPSHOT_PATH = CATALOG_JSON_PATH;

type CatalogMode = 'pending' | 'full' | 'seed';

let ingestedCache: { mtime: number; items: CatalogEntry[] } | null = null;
let mergedCache: { mtime: number; items: CatalogEntry[] } | null = null;
let mode: CatalogMode = 'pending';
let skipLogged = false;

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

export function catalogRuntime() {
  const files = snapshotFileStats();
  return {
    ...files,
    loaded: mode !== 'pending',
    mode,
    intended: shouldLoadFullSnapshot() ? 'full' : 'seed',
    titles: mergedCache?.items.length ?? null,
  };
}

export function readIngested(): CatalogEntry[] {
  if (typeof window !== 'undefined') return [];
  if (!shouldLoadFullSnapshot()) {
    if (!skipLogged) {
      skipLogged = true;
      console.warn(
        '[war] skipping data/catalog.json.gz (low memory). Seed catalogue only. Set CATALOG_FULL=1 or use ≥1GB RAM.',
      );
    }
    mode = mode === 'full' ? mode : 'seed';
    return [];
  }
  const mtime = snapshotMtime();
  if (!mtime) return [];
  if (ingestedCache && ingestedCache.mtime === mtime)
    return ingestedCache.items;
  const items = loadSnapshot();
  ingestedCache = { mtime, items };
  return items;
}

/** Editorial seed only. Never gunzips the 24MB ingest snapshot. */
export function getShelfCatalog(): CatalogEntry[] {
  return SEED_CATALOG;
}

/** Full snapshot only when CATALOG_FULL=1; otherwise the seed shelf. */
export function getSearchCatalog(): CatalogEntry[] {
  if (shouldLoadFullSnapshot()) return getCatalog();
  return getShelfCatalog();
}

export function getCatalog(): CatalogEntry[] {
  const ingested = readIngested();
  const mtime = snapshotMtime() || 1;
  if (mergedCache && mergedCache.mtime === mtime) return mergedCache.items;
  let items: CatalogEntry[];
  if (ingested.length === 0) {
    mode = 'seed';
    items = SEED_CATALOG;
  } else {
    const byId = new Map<string, CatalogEntry>();
    for (const item of ingested) {
      byId.set(item.id, item);
    }
    for (const item of SEED_CATALOG) {
      byId.set(item.id, item);
    }
    items = [...byId.values()];
    mode = 'full';
  }
  mergedCache = { mtime, items };
  return items;
}

export function getEntry(id: string): CatalogEntry | undefined {
  const seed = SEED_CATALOG.find((item) => item.id === id);
  if (seed) return seed;
  if (!shouldLoadFullSnapshot()) return undefined;
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
