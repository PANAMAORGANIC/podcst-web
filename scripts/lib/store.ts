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

export function upsertCatalog(
  entries: CatalogEntry[],
  options: { replaceFeeds?: boolean } = {},
): {
  added: number;
  updated: number;
  total: number;
  snapshot: SnapshotWriteResult;
} {
  const byId = new Map(loadIngested().map((item) => [item.id, item]));
  if (options.replaceFeeds) {
    const incomingIds = new Set(entries.map((item) => item.id));
    const incomingFeeds = new Set(
      entries
        .map((item) => normalizeRss(item.externalUrls.rss))
        .filter(Boolean),
    );
    for (const [id, item] of byId) {
      const feed = normalizeRss(item.externalUrls.rss);
      if (feed && incomingFeeds.has(feed) && !incomingIds.has(id)) {
        if (id.startsWith('it-')) continue;
        byId.delete(id);
      }
    }
    for (const entry of entries) {
      const feed = normalizeRss(entry.externalUrls.rss);
      if (!feed) continue;
      const hasApple = [...byId.values()].some(
        (item) =>
          item.id.startsWith('it-') &&
          normalizeRss(item.externalUrls.rss) === feed,
      );
      if (hasApple && !entry.id.startsWith('it-')) {
        incomingIds.delete(entry.id);
      }
    }
  }
  let added = 0;
  let updated = 0;
  for (const entry of entries) {
    const feed = normalizeRss(entry.externalUrls.rss);
    const appleOwnsFeed =
      feed &&
      [...byId.values()].some(
        (item) =>
          item.id.startsWith('it-') &&
          item.id !== entry.id &&
          normalizeRss(item.externalUrls.rss) === feed,
      );
    if (appleOwnsFeed && !entry.id.startsWith('it-')) continue;
    if (byId.has(entry.id)) updated += 1;
    else added += 1;
    byId.set(entry.id, entry);
  }
  const items = [...byId.values()];
  const snapshot = writeSnapshot(items);
  return { added, updated, total: items.length, snapshot };
}

function normalizeRss(url: string | undefined): string {
  if (!url) return '';
  try {
    const parsed = new URL(url.trim());
    parsed.hash = '';
    parsed.hostname = parsed.hostname.toLowerCase();
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    return parsed.toString();
  } catch {
    return url.trim();
  }
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
