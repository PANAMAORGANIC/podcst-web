#!/usr/bin/env npx tsx

/**
 * Podcast ingest — metadata and RSS deep links only.
 *
 * Always (unless ITUNES_HARVEST=0): Apple / iTunes storefront harvest.
 * When configured: Podcast Index public feeds dump
 *   (PODCASTINDEX_DUMP_PATH, cached .tmp dump, or PODCASTINDEX_DOWNLOAD=1).
 * Optional extra: Podcast Index API if both key and secret are set.
 *
 * Never downloads episode audio.
 */

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createWriteStream, existsSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import {
  clampSignal,
  diversityScore,
  inferCountryName,
  inferRegion,
  normalizeLanguage,
} from '../src/catalog/taxonomy';
import type { CatalogEntry } from '../src/catalog/types';
import {
  countItems,
  parseFocus,
  takeDiverse,
  takeFocused,
} from './lib/diversity';
import { fetchJson, sleep } from './lib/http';
import {
  itunesStorefronts,
  loadItunesQueries,
  type QuerySpec,
} from './lib/itunes-queries';
import {
  ingestLimit,
  slugId,
  stripHtml,
  upsertCatalog,
  writeReceipt,
} from './lib/store';

const DUMP_URL =
  process.env.PODCASTINDEX_DUMP_URL ??
  'https://public.podcastindex.org/podcastindex_feeds.db.tgz';
const TMP = path.join(process.cwd(), '.tmp');
const DEFAULT_DUMP = path.join(TMP, 'podcastindex_feeds.db');
const UA =
  'WorldAudioRepository/1.0 (+https://github.com/PANAMAORGANIC/podcst-web)';

interface ItunesPodcast {
  collectionId?: number;
  collectionName?: string;
  artistName?: string;
  feedUrl?: string;
  artworkUrl600?: string;
  artworkUrl100?: string;
  collectionViewUrl?: string;
  country?: string;
  genres?: string[];
  trackCount?: number;
  primaryGenreName?: string;
}

interface PiSearchHit {
  id: number;
  title: string;
  url: string;
  originalUrl?: string;
  link?: string;
  description?: string;
  author?: string;
  image?: string;
  language?: string;
}

async function main() {
  const started = Date.now();
  const limit = ingestLimit(25_000);
  const focus = parseFocus();
  const itunesOn = process.env.ITUNES_HARVEST !== '0';
  console.log('World Audio Repository — podcast ingest');
  console.log('Metadata + RSS links only. No audio files.');
  console.log(
    `INGEST_LIMIT=${limit} per strategy. iTunes harvest ${itunesOn ? 'on' : 'off'}.` +
      (focus.length ? ` Focus: ${focus.join(', ')}.` : ''),
  );

  const sources: string[] = [];
  const dumpEntries: CatalogEntry[] = [];
  const apiEntries: CatalogEntry[] = [];
  let itunesEntries: CatalogEntry[] = [];
  const warnings: string[] = [];

  const dumpPath = findDump();
  if (dumpPath || process.env.PODCASTINDEX_DOWNLOAD === '1') {
    try {
      const resolved = dumpPath ?? (await downloadDump());
      console.log(`Reading Podcast Index dump: ${resolved}`);
      dumpEntries.push(...fromDump(resolved, limit, focus));
      sources.push(`podcast-index-dump:${resolved}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Podcast Index dump skipped: ${message}`);
      warnings.push(`dump:${message}`);
    }
  } else {
    console.log(
      'No dump configured. Set PODCASTINDEX_DUMP_PATH or PODCASTINDEX_DOWNLOAD=1.',
    );
  }

  if (process.env.PODCASTINDEX_API_KEY && process.env.PODCASTINDEX_API_SECRET) {
    console.log('Podcast Index API (bounded diversity search).');
    apiEntries.push(...(await fromPodcastIndexApi(limit)));
    sources.push('podcast-index-api');
  }

  if (itunesOn) {
    console.log('Apple / iTunes storefront harvest (public search, no key).');
    itunesEntries = await fromItunesQueries(limit, focus);
    sources.push('itunes-storefront-harvest');
  }

  const entries = [...dumpEntries, ...apiEntries, ...itunesEntries];
  const result = upsertCatalog(entries);
  const queries = itunesOn ? loadItunesQueries(process.cwd(), focus) : [];
  const receipt = writeReceipt('podcasts.receipt.json', {
    ok: true,
    sources,
    dumpUrl: DUMP_URL,
    limit,
    dumpMapped: dumpEntries.length,
    apiMapped: apiEntries.length,
    itunesMapped: itunesEntries.length,
    itunesStorefronts: itunesStorefronts(queries),
    itunesQueries: queries.length,
    warnings,
    snapshotBytes: result.snapshot,
    elapsedMs: Date.now() - started,
    focus,
    focusCounts: Object.fromEntries(
      focus.map((language) => [
        language,
        entries.filter((item) => item.originalLanguage === language).length,
      ]),
    ),
    languages: [...new Set(entries.map((item) => item.originalLanguage))],
    rateLimit:
      'iTunes Search is unauthenticated. We space requests (~180ms) and back off on HTTP 429. Official max is 200 results per query; we request 50.',
    note: 'Re-run is idempotent. Dump and Apple harvest upsert into data/catalog.json.gz (and compact JSON if under 40MB). ITUNES_HARVEST=0 skips Apple.',
  });

  console.log(
    `Dump ${dumpEntries.length} · API ${apiEntries.length} · iTunes ${itunesEntries.length}.`,
  );
  console.log(
    `Upserted ${entries.length} podcast rows (${result.added} added, ${result.updated} updated). Snapshot ${result.total} ingested titles.`,
  );
  console.log(
    `Snapshot gz ${(result.snapshot.gzBytes / 1024 / 1024).toFixed(1)} MB` +
      (result.snapshot.wroteJson
        ? ` · json ${(result.snapshot.jsonBytes / 1024 / 1024).toFixed(1)} MB`
        : ' · json omitted (>40MB)'),
  );
  console.log(`Elapsed ${((Date.now() - started) / 1000).toFixed(1)}s`);
  console.log(`Receipt: ${receipt}`);
}

function findDump(): string | null {
  const candidates = [
    process.env.PODCASTINDEX_DUMP_PATH,
    DEFAULT_DUMP,
    path.join(TMP, 'podcastindex_feeds.db.sqlite'),
  ].filter(Boolean) as string[];
  return (
    candidates.find((file) => existsSync(file) && statSync(file).size > 0) ??
    null
  );
}

async function downloadDump(): Promise<string> {
  mkdirSync(TMP, { recursive: true });
  const tgz = path.join(TMP, 'podcastindex_feeds.db.tgz');
  const existing = existsSync(tgz) ? statSync(tgz).size : 0;
  console.log(
    existing
      ? `Resuming dump download from ${existing} bytes (${DUMP_URL})`
      : `Downloading dump (${DUMP_URL}) — about 1.8GB.`,
  );

  const headers: Record<string, string> = { 'User-Agent': UA };
  if (existing > 0) headers.Range = `bytes=${existing}-`;

  const response = await fetch(DUMP_URL, { headers });
  if (response.status === 416 && existsSync(tgz)) {
    console.log('Dump archive already complete.');
  } else if (!response.ok && response.status !== 206) {
    throw new Error(`Dump download failed (${response.status})`);
  } else if (response.body) {
    const flags = existing > 0 && response.status === 206 ? 'a' : 'w';
    const file = createWriteStream(tgz, { flags });
    let received = flags === 'a' ? existing : 0;
    let lastLog = 0;
    const progress = new Transform({
      transform(chunk, _enc, cb) {
        received += (chunk as Buffer).length;
        if (received - lastLog >= 80 * 1024 * 1024) {
          lastLog = received;
          console.log(`Dump download ${Math.round(received / 1024 / 1024)} MB`);
        }
        cb(null, chunk);
      },
    });
    await pipeline(
      Readable.fromWeb(
        response.body as import('node:stream/web').ReadableStream,
      ),
      progress,
      file,
    );
    console.log(
      `Dump archive ${Math.round(statSync(tgz).size / 1024 / 1024)} MB`,
    );
  }

  console.log('Extracting Podcast Index SQLite dump…');
  execFileSync('tar', ['-xzf', tgz, '-C', TMP]);
  const found = findDump();
  if (!found) {
    throw new Error('Dump extracted but no SQLite file was found in .tmp/');
  }
  return found;
}

function fromDump(
  dbPath: string,
  limit: number,
  focus: string[] = [],
): CatalogEntry[] {
  const { DatabaseSync } = require('node:sqlite') as {
    DatabaseSync: new (
      path: string,
      options?: { readOnly?: boolean },
    ) => {
      prepare: (sql: string) => {
        all: (...args: unknown[]) => unknown[];
      };
      close: () => void;
    };
  };
  const db = new DatabaseSync(dbPath, { readOnly: true });
  const table = dumpTable(db);
  const columns = dumpColumns(db, table);
  const langCol = pickColumn(columns, ['language', 'lang', 'itunesLanguage']);
  const titleCol = pickColumn(columns, ['title', 'podcastTitle']);
  const urlCol = pickColumn(columns, ['url', 'originalUrl', 'feedUrl']);
  if (!titleCol || !urlCol) {
    db.close();
    throw new Error(
      `Dump missing title/url columns. Have: ${columns.join(', ')}`,
    );
  }

  const descCol = pickColumn(columns, ['description', 'itunesSummary']);
  const selectCols = [
    'id',
    urlCol,
    titleCol,
    pickColumn(columns, ['link', 'podcastLink', 'website']),
    pickColumn(columns, ['itunesAuthor', 'author', 'ownerName']),
    pickColumn(columns, ['imageUrl', 'artwork', 'image']),
    langCol,
    pickColumn(columns, ['episodeCount', 'episode_count']),
    pickColumn(columns, ['popularityScore', 'popularity']),
    descCol ? `substr(${descCol}, 1, 700) AS description` : undefined,
    pickColumn(columns, ['category1']),
    pickColumn(columns, ['category2']),
  ].filter(Boolean) as string[];

  const window = Math.min(500_000, Math.max(200_000, limit * 5));
  const perLangCap = Math.max(400, Math.ceil((limit * 2) / 50));
  const focusCap = Math.max(perLangCap, Math.ceil(limit * 0.7));
  const langFilter = langCol
    ? `AND IFNULL(${langCol}, '') != '' AND lower(${langCol}) NOT IN ('mul', 'xx', '??')`
    : '';
  const selectSql = `SELECT ${selectCols.join(', ')}
       FROM ${table}
       WHERE IFNULL(dead, 0) = 0
         AND ${titleCol} IS NOT NULL
         AND ${urlCol} IS NOT NULL
         ${langFilter}`;
  console.log(
    `Dump sample window ${window} · per-language cap ${perLangCap}` +
      (focus.length ? ` · focus cap ${focusCap} (${focus.join(',')})` : '') +
      ` (limit ${limit}).`,
  );
  const rows = db
    .prepare(`${selectSql} AND id % 7 IN (0, 2, 4) LIMIT ?`)
    .all(window) as Record<string, unknown>[];

  if (focus.length && langCol) {
    for (const language of focus) {
      const extraLimit = Math.min(
        90_000,
        Math.max(20_000, Math.ceil(limit * 0.8)),
      );
      const extra = db
        .prepare(
          `${selectSql} AND lower(${langCol}) LIKE ? AND id % 3 IN (0, 1) LIMIT ?`,
        )
        .all(`${language}%`, extraLimit) as Record<string, unknown>[];
      console.log(`Dump focus extra ${language}: ${extra.length} rows.`);
      rows.push(...extra);
    }
  }
  db.close();

  const buckets = new Map<string, CatalogEntry[]>();
  for (const row of rows) {
    const language = normalizeLanguage(
      String((langCol ? row[langCol] : row.language) ?? 'en'),
    );
    if (language === 'mul') continue;
    const entry = mapDumpRow(row, language, urlCol, titleCol);
    if (!entry) continue;
    const list = buckets.get(language) ?? [];
    const cap = focus.includes(language) ? focusCap : perLangCap;
    if (list.length >= cap) continue;
    list.push(entry);
    buckets.set(language, list);
  }
  console.log(
    `Dump pass ${rows.length} rows → ${countItems(buckets)} candidates across ${buckets.size} languages.`,
  );
  const sampled = takeFocused(buckets, limit, focus);
  const focusNote = focus.length
    ? ` focus ${focus.map((language) => `${language}=${sampled.filter((item) => item.originalLanguage === language).length}`).join(' ')}`
    : ' diversity-first';
  console.log(
    `Dump sampled ${sampled.length} feeds across ${new Set(sampled.map((item) => item.originalLanguage)).size} languages (${focusNote}).`,
  );
  return sampled;
}

function dumpTable(db: {
  prepare: (sql: string) => { all: (...args: unknown[]) => unknown[] };
}): string {
  const tables = db
    .prepare(`SELECT name FROM sqlite_master WHERE type = 'table'`)
    .all() as { name: string }[];
  const names = tables.map((row) => row.name);
  if (names.includes('podcasts')) return 'podcasts';
  if (names.includes('feeds')) return 'feeds';
  throw new Error(`Unknown dump schema. Tables: ${names.join(', ')}`);
}

function dumpColumns(
  db: {
    prepare: (sql: string) => { all: (...args: unknown[]) => unknown[] };
  },
  table: string,
): string[] {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as {
    name: string;
  }[];
  return rows.map((row) => row.name);
}

function pickColumn(columns: string[], names: string[]): string | undefined {
  const lower = new Map(columns.map((col) => [col.toLowerCase(), col]));
  for (const name of names) {
    const hit = lower.get(name.toLowerCase());
    if (hit) return hit;
  }
  return undefined;
}

function mapDumpRow(
  row: Record<string, unknown>,
  language: string,
  urlCol: string,
  titleCol: string,
): CatalogEntry | null {
  const title = String(row[titleCol] ?? row.title ?? '').trim();
  const feed = String(row[urlCol] ?? row.url ?? '').trim();
  if (!title || !feed || language === 'mul') return null;
  const id = row.id != null ? `pi-${row.id}` : slugId('pi', feed);
  const author =
    row.itunesAuthor ?? row.author ?? row.ownerName ?? row.itunesOwnerName;
  const image = row.imageUrl ?? row.artwork ?? row.image;
  const link = row.link ?? row.podcastLink ?? row.website;
  const popularity = clampSignal(Number(row.popularityScore ?? 20) / 10);
  return {
    id,
    type: 'podcast',
    title,
    originalLanguage: language,
    creators: author ? [String(author)] : ['Unknown'],
    description: stripHtml(String(row.description ?? title)).slice(0, 700),
    tags: ['podcast-index', 'ingested', language],
    genres: dumpGenres(row),
    region: inferRegion(language),
    country: inferCountryName(),
    countryCode: '',
    externalUrls: {
      rss: feed,
      website: link ? String(link) : undefined,
      podcastIndex: `https://podcastindex.org/podcast/${row.id}`,
    },
    coverArt: image ? String(image) : undefined,
    signals: {
      popularity,
      diversity: diversityScore(language),
    },
    episodeCount: Number(row.episodeCount ?? 0) || undefined,
  };
}

async function fromPodcastIndexApi(limit: number): Promise<CatalogEntry[]> {
  const queries = loadItunesQueries().filter((query) => !query.genreId);
  const buckets = new Map<string, CatalogEntry[]>();
  for (const query of queries.slice(0, 80)) {
    const items = await podcastIndexSearch(query.term);
    for (const item of items) {
      const language = normalizeLanguage(item.language ?? query.language);
      const entry: CatalogEntry = {
        id: `pi-${item.id}`,
        type: 'podcast',
        title: item.title,
        originalLanguage: language,
        creators: item.author ? [item.author] : ['Unknown'],
        description: stripHtml(item.description || item.title),
        tags: ['podcast-index', 'ingested', language],
        genres: ['podcast'],
        region: query.region || inferRegion(language),
        country: inferCountryName(query.country),
        countryCode: query.country.toUpperCase(),
        externalUrls: {
          rss: item.url,
          website: item.link,
          podcastIndex: `https://podcastindex.org/podcast/${item.id}`,
        },
        coverArt: item.image,
        signals: {
          popularity: 40,
          diversity: diversityScore(language),
        },
      };
      const list = buckets.get(language) ?? [];
      list.push(entry);
      buckets.set(language, list);
    }
    await sleep(120);
  }
  return takeDiverse(buckets, limit);
}

async function podcastIndexSearch(term: string): Promise<PiSearchHit[]> {
  const key = process.env.PODCASTINDEX_API_KEY ?? '';
  const secret = process.env.PODCASTINDEX_API_SECRET ?? '';
  const apiHeaderTime = Math.floor(Date.now() / 1000).toString();
  const authorization = createHash('sha1')
    .update(key + secret + apiHeaderTime)
    .digest('hex');
  const url = new URL('https://api.podcastindex.org/api/1.0/search/byterm');
  url.searchParams.set('q', term);
  url.searchParams.set('max', '20');
  const result = await fetchJson<{ feeds?: PiSearchHit[] }>(url, {
    headers: {
      'X-Auth-Key': key,
      'X-Auth-Date': apiHeaderTime,
      Authorization: authorization,
    },
  });
  if (!result.ok) {
    console.warn(`Podcast Index API ${result.status} for ${term}`);
    return [];
  }
  return result.data.feeds ?? [];
}

async function fromItunesQueries(
  limit: number,
  focus: string[] = [],
): Promise<CatalogEntry[]> {
  const queries = loadItunesQueries(process.cwd(), focus).sort((a, b) => {
    const aFocus = focus.includes(a.language) ? 0 : 1;
    const bFocus = focus.includes(b.language) ? 0 : 1;
    return aFocus - bFocus;
  });
  console.log(
    `iTunes queries: ${queries.length} across storefronts ${itunesStorefronts(queries).join(', ')}`,
  );
  const perQuery = focus.length ? '200' : '50';
  const buckets = new Map<string, CatalogEntry[]>();
  for (const query of queries) {
    const url = new URL('https://itunes.apple.com/search');
    url.searchParams.set('media', 'podcast');
    url.searchParams.set('entity', 'podcast');
    url.searchParams.set('country', query.country);
    url.searchParams.set('term', query.term);
    url.searchParams.set('limit', perQuery);
    if (query.genreId) url.searchParams.set('genreId', String(query.genreId));
    const result = await fetchJson<{ results?: ItunesPodcast[] }>(url);
    if (!result.ok) {
      console.warn(
        `iTunes ${result.status} for ${query.country}/${query.term}${query.genreId ? `/${query.genreId}` : ''}`,
      );
      await sleep(result.status === 429 ? 2000 : 400);
      continue;
    }
    const hits = result.data.results ?? [];
    for (const item of hits) {
      const entry = mapItunes(item, query);
      if (!entry) continue;
      const list = buckets.get(query.language) ?? [];
      list.push(entry);
      buckets.set(query.language, list);
    }
    if (hits.length) {
      console.log(
        `iTunes ${query.country}/${query.term}${query.genreId ? `/${query.genreId}` : ''}: ${hits.length} (${countItems(buckets)} mapped)`,
      );
    }
    await sleep(180);
    if (countItems(buckets) >= limit * 3) break;
  }
  return takeFocused(buckets, limit, focus);
}

function mapItunes(item: ItunesPodcast, query: QuerySpec): CatalogEntry | null {
  if (!item.collectionName || !item.feedUrl || !item.collectionId) return null;
  const language = normalizeLanguage(query.language);
  return {
    id: `it-${item.collectionId}`,
    type: 'podcast',
    title: item.collectionName,
    originalLanguage: language,
    creators: [item.artistName || 'Unknown'],
    description: `${item.collectionName} — ${item.primaryGenreName ?? 'podcast'} from ${inferCountryName(query.country)}. Ingested as metadata; open the RSS feed to listen.`,
    tags: ['itunes', 'ingested', language, ...(item.genres ?? []).slice(0, 4)],
    genres: item.genres?.slice(0, 3).map(genreSlug) ?? ['podcast'],
    region: query.region,
    country: inferCountryName(query.country),
    countryCode: query.country.slice(0, 2).toUpperCase(),
    externalUrls: {
      rss: item.feedUrl,
      store: item.collectionViewUrl,
    },
    coverArt: item.artworkUrl600 || item.artworkUrl100,
    signals: {
      popularity: clampSignal(
        30 + Math.min(40, Number(item.trackCount ?? 0) / 20),
      ),
      diversity: diversityScore(language),
    },
    episodeCount: item.trackCount,
  };
}

function dumpGenres(row: Record<string, unknown>): string[] {
  const genres = [row.category1, row.category2]
    .filter(Boolean)
    .map((value) => genreSlug(String(value)))
    .slice(0, 3);
  return genres.length ? genres : ['podcast'];
}

function genreSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
