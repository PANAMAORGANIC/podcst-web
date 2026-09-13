import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  CATALOG_JSON_PATH,
  loadSnapshot,
  type SnapshotWriteResult,
  writeSnapshot,
} from '../../src/catalog/snapshot';
import type { CatalogEntry } from '../../src/catalog/types';

export { writeSnapshot };

export const DATA_DIR = path.join(process.cwd(), 'data');
export const CATALOG_PATH = CATALOG_JSON_PATH;
export const INGEST_DIR = path.join(DATA_DIR, 'ingest');

export function loadIngested(): CatalogEntry[] {
  return loadSnapshot();
}

export function upsertCatalog(entries: CatalogEntry[]): {
  added: number;
  updated: number;
  total: number;
  snapshot: SnapshotWriteResult;
} {
  const byId = new Map(loadIngested().map((item) => [item.id, item]));
  let added = 0;
  let updated = 0;
  for (const entry of entries) {
    if (byId.has(entry.id)) updated += 1;
    else added += 1;
    byId.set(entry.id, entry);
  }
  const items = [...byId.values()];
  const snapshot = writeSnapshot(items);
  return { added, updated, total: items.length, snapshot };
}

export function writeReceipt(name: string, body: unknown) {
  mkdirSync(INGEST_DIR, { recursive: true });
  const outPath = path.join(INGEST_DIR, name);
  writeFileSync(outPath, `${JSON.stringify(body, null, 2)}\n`);
  return outPath;
}

export function ingestLimit(fallback = 800): number {
  const raw = Number(process.env.INGEST_LIMIT ?? fallback);
  return Number.isFinite(raw) && raw > 0 ? raw : fallback;
}

export function stripHtml(value: string | undefined): string {
  if (!value) return '';
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function slugId(prefix: string, raw: string): string {
  const slug = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return `${prefix}-${slug || 'item'}`;
}
