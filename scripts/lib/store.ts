import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { CatalogEntry } from '../../src/catalog/types';

export const DATA_DIR = path.join(process.cwd(), 'data');
export const CATALOG_PATH = path.join(DATA_DIR, 'catalog.json');
export const INGEST_DIR = path.join(DATA_DIR, 'ingest');

export interface CatalogSnapshot {
  generatedAt: string;
  items: CatalogEntry[];
}

export function loadIngested(): CatalogEntry[] {
  if (!existsSync(CATALOG_PATH)) return [];
  const parsed = JSON.parse(readFileSync(CATALOG_PATH, 'utf8')) as
    | CatalogSnapshot
    | CatalogEntry[];
  return Array.isArray(parsed) ? parsed : (parsed.items ?? []);
}

export function writeSnapshot(items: CatalogEntry[]): void {
  mkdirSync(DATA_DIR, { recursive: true });
  const snapshot: CatalogSnapshot = {
    generatedAt: new Date().toISOString(),
    items,
  };
  writeFileSync(CATALOG_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);
}

export function upsertCatalog(entries: CatalogEntry[]): {
  added: number;
  updated: number;
  total: number;
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
  writeSnapshot(items);
  return { added, updated, total: items.length };
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
