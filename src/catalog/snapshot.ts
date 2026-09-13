import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { gunzipSync, gzipSync } from 'node:zlib';
import type { CatalogEntry } from './types';

export const CATALOG_JSON_PATH = path.join(
  process.cwd(),
  'data',
  'catalog.json',
);
export const CATALOG_GZ_PATH = path.join(
  process.cwd(),
  'data',
  'catalog.json.gz',
);

export interface CatalogSnapshot {
  generatedAt: string;
  items: CatalogEntry[];
}

export interface SnapshotWriteResult {
  items: number;
  jsonBytes: number;
  gzBytes: number;
  wroteJson: boolean;
  path: string;
}

const GIT_WARN_BYTES = 40 * 1024 * 1024;

export function loadSnapshot(): CatalogEntry[] {
  return snapshotItems(readSnapshotFile()) ?? [];
}

function readSnapshotFile(): CatalogSnapshot | CatalogEntry[] | null {
  const gz = existsSync(CATALOG_GZ_PATH);
  const json = existsSync(CATALOG_JSON_PATH);
  if (gz && json) {
    const jsonParsed = parseBuffer(readFileSync(CATALOG_JSON_PATH));
    const jsonItems = snapshotItems(jsonParsed);
    const gzNewer =
      statSync(CATALOG_GZ_PATH).mtimeMs >= statSync(CATALOG_JSON_PATH).mtimeMs;
    if (jsonItems && !gzNewer) return jsonParsed;
    return parseBuffer(gunzipSync(readFileSync(CATALOG_GZ_PATH)));
  }
  if (gz) return parseBuffer(gunzipSync(readFileSync(CATALOG_GZ_PATH)));
  if (json) return parseBuffer(readFileSync(CATALOG_JSON_PATH));
  return null;
}

function parseBuffer(buf: Buffer): CatalogSnapshot | CatalogEntry[] {
  return JSON.parse(buf.toString('utf8')) as CatalogSnapshot | CatalogEntry[];
}

function snapshotItems(
  parsed: CatalogSnapshot | CatalogEntry[] | null,
): CatalogEntry[] | null {
  if (!parsed) return null;
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.items)) return parsed.items;
  return null;
}

export function writeSnapshot(items: CatalogEntry[]): SnapshotWriteResult {
  mkdirSync(path.dirname(CATALOG_GZ_PATH), { recursive: true });
  const snapshot: CatalogSnapshot = {
    generatedAt: new Date().toISOString(),
    items,
  };
  const compact = Buffer.from(JSON.stringify(snapshot), 'utf8');
  const gz = gzipSync(compact, { level: 9 });
  writeFileSync(CATALOG_GZ_PATH, gz);

  let wroteJson = false;
  if (compact.length < GIT_WARN_BYTES) {
    writeFileSync(CATALOG_JSON_PATH, compact);
    wroteJson = true;
  } else if (existsSync(CATALOG_JSON_PATH)) {
    unlinkSync(CATALOG_JSON_PATH);
  }

  return {
    items: items.length,
    jsonBytes: compact.length,
    gzBytes: gz.length,
    wroteJson,
    path: CATALOG_GZ_PATH,
  };
}
