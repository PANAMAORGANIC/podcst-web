import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { favoriteId, loadFavoritesFile } from '../../scripts/lib/favorites';
import { getCatalog, getEntry } from './store';
import type { CatalogEntry } from './types';

export { isLikeId, LIKED_STORAGE_KEY } from './like-constants';

export const LIKED_FILE = path.join(
  process.cwd(),
  'data',
  'sources',
  'liked.json',
);

export interface LikedFile {
  ids: string[];
  updatedAt?: string;
}

export function listFavoriteSeedIds(root = process.cwd()): string[] {
  return loadFavoritesFile(root).shows.map((show) => favoriteId(show));
}

export function readLikedFile(root = process.cwd()): string[] {
  const file = path.join(root, 'data', 'sources', 'liked.json');
  if (!existsSync(file)) return [];
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as
      | LikedFile
      | string[];
    const ids = Array.isArray(parsed) ? parsed : parsed.ids;
    return (ids ?? []).filter((id) => typeof id === 'string' && id.length > 0);
  } catch {
    return [];
  }
}

export function listIngestLikeIds(root = process.cwd()): string[] {
  return uniqueIds([...listFavoriteSeedIds(root), ...readLikedFile(root)]);
}

export function listSeedEntries(root = process.cwd()): CatalogEntry[] {
  const catalog = getCatalog();
  const byId = new Map(catalog.map((item) => [item.id, item]));
  const out: CatalogEntry[] = [];
  const seen = new Set<string>();
  for (const id of listFavoriteSeedIds(root)) {
    const hit = byId.get(id) ?? catalog.find((item) => item.id === id);
    if (hit && !seen.has(hit.id)) {
      seen.add(hit.id);
      out.push(hit);
    }
  }
  for (const show of loadFavoritesFile(root).shows) {
    if (seen.has(favoriteId(show))) continue;
    const hit = catalog.find((item) => item.title === show.title);
    if (hit && !seen.has(hit.id)) {
      seen.add(hit.id);
      out.push(hit);
    }
  }
  return out;
}

export function resolveLikeIds(ids: string[]): CatalogEntry[] {
  const out: CatalogEntry[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    const hit = getEntry(id);
    if (hit && !seen.has(hit.id)) {
      seen.add(hit.id);
      out.push(hit);
    }
  }
  return out;
}

export function uniqueIds(ids: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}
