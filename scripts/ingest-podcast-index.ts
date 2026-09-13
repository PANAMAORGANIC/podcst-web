#!/usr/bin/env npx tsx

/**
 * Podcast ingest — metadata and RSS deep links only.
 *
 * Order:
 *  1. Local Podcast Index SQLite dump (PODCASTINDEX_DUMP_PATH or cache)
 *  2. Optional download of the public dump if PODCASTINDEX_DOWNLOAD=1
 *  3. Podcast Index API if PODCASTINDEX_API_KEY + SECRET are set
 *  4. iTunes Search across curated country/language queries (no key)
 *
 * Never downloads episode audio.
 */

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  clampSignal,
  diversityScore,
  inferCountryName,
  inferRegion,
  normalizeLanguage,
} from '../src/catalog/taxonomy';
import type { CatalogEntry } from '../src/catalog/types';
import { fetchJson, sleep } from './lib/http';
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

interface QuerySpec {
  country: string;
  term: string;
  language: string;
  region: string;
}

async function main() {
  const limit = ingestLimit(800);
  console.log('World Audio Repository — podcast ingest');
  console.log('Metadata + RSS links only. No audio files.');

  let entries: CatalogEntry[] = [];
  let source = 'none';

  const dumpPath = findDump();
  if (dumpPath) {
    console.log(`Reading Podcast Index dump: ${dumpPath}`);
    entries = fromDump(dumpPath, limit);
    source = `podcast-index-dump:${dumpPath}`;
  } else if (process.env.PODCASTINDEX_DOWNLOAD === '1') {
    console.log(`Downloading dump (${DUMP_URL}) — this is large.`);
    const downloaded = await downloadDump();
    entries = fromDump(downloaded, limit);
    source = 'podcast-index-dump:download';
  } else if (
    process.env.PODCASTINDEX_API_KEY &&
    process.env.PODCASTINDEX_API_SECRET
  ) {
    console.log('Using Podcast Index API (bounded diversity search).');
    entries = await fromPodcastIndexApi(limit);
    source = 'podcast-index-api';
  } else {
    console.log(
      'No dump or API keys. Harvesting iTunes Search across language/country queries.',
    );
    entries = await fromItunesQueries(limit);
    source = 'itunes-search-diversity';
  }

  const result = upsertCatalog(entries);
  const receipt = writeReceipt('podcasts.receipt.json', {
    ok: true,
    source,
    dumpUrl: DUMP_URL,
    limit,
    mapped: entries.length,
    ...result,
    languages: [...new Set(entries.map((item) => item.originalLanguage))],
    note: 'Re-run is idempotent. Set PODCASTINDEX_DUMP_PATH or PODCASTINDEX_DOWNLOAD=1 to use the official dump.',
  });

  console.log(
    `Upserted ${entries.length} podcasts (${result.added} added, ${result.updated} updated). Snapshot ${result.total} ingested titles.`,
  );
  console.log(`Receipt: ${receipt}`);
}

function findDump(): string | null {
  const candidates = [
    process.env.PODCASTINDEX_DUMP_PATH,
    DEFAULT_DUMP,
    path.join(TMP, 'podcastindex_feeds.db.sqlite'),
  ].filter(Boolean) as string[];
  return candidates.find((file) => existsSync(file)) ?? null;
}

async function downloadDump(): Promise<string> {
  mkdirSync(TMP, { recursive: true });
  const tgz = path.join(TMP, 'podcastindex_feeds.db.tgz');
  const response = await fetch(DUMP_URL, {
    headers: {
      'User-Agent':
        'WorldAudioRepository/1.0 (+https://github.com/PANAMAORGANIC/podcst-web)',
    },
  });
  if (!response.ok) {
    throw new Error(`Dump download failed (${response.status})`);
  }
  writeFileSync(tgz, Buffer.from(await response.arrayBuffer()));
  execFileSync('tar', ['-xzf', tgz, '-C', TMP]);
  const found = findDump();
  if (!found) {
    throw new Error('Dump extracted but no SQLite file was found in .tmp/');
  }
  return found;
}

function fromDump(dbPath: string, limit: number): CatalogEntry[] {
  const { DatabaseSync } = require('node:sqlite') as {
    DatabaseSync: new (
      path: string,
      options?: { readOnly?: boolean },
    ) => {
      prepare: (sql: string) => { all: () => unknown[] };
      close: () => void;
    };
  };
  const db = new DatabaseSync(dbPath, { readOnly: true });
  const table = dumpTable(db);
  const rows = db
    .prepare(
      `SELECT id, url, title, link, itunesAuthor, imageUrl, language,
              episodeCount, popularityScore, description, dead
       FROM ${table}
       WHERE IFNULL(dead, 0) = 0
         AND title IS NOT NULL
         AND url IS NOT NULL
         AND IFNULL(language, '') != ''
       LIMIT 20000`,
    )
    .all() as Record<string, unknown>[];
  db.close();

  const buckets = new Map<string, CatalogEntry[]>();
  for (const row of rows) {
    const language = normalizeLanguage(String(row.language ?? 'en'));
    const entry = mapDumpRow(row, language);
    if (!entry) continue;
    const list = buckets.get(language) ?? [];
    list.push(entry);
    buckets.set(language, list);
  }
  return takeDiverse(buckets, limit);
}

function dumpTable(db: {
  prepare: (sql: string) => { all: () => unknown[] };
}): string {
  const tables = db
    .prepare(`SELECT name FROM sqlite_master WHERE type = 'table'`)
    .all() as { name: string }[];
  const names = tables.map((row) => row.name);
  if (names.includes('podcasts')) return 'podcasts';
  if (names.includes('feeds')) return 'feeds';
  throw new Error(`Unknown dump schema. Tables: ${names.join(', ')}`);
}

function mapDumpRow(
  row: Record<string, unknown>,
  language: string,
): CatalogEntry | null {
  const title = String(row.title ?? '').trim();
  const feed = String(row.url ?? '').trim();
  if (!title || !feed) return null;
  const id = row.id != null ? `pi-${row.id}` : slugId('pi', feed);
  const popularity = clampSignal(Number(row.popularityScore ?? 20) / 10);
  return {
    id,
    type: 'podcast',
    title,
    originalLanguage: language,
    creators: row.itunesAuthor ? [String(row.itunesAuthor)] : ['Unknown'],
    description: stripHtml(String(row.description ?? title)),
    tags: ['podcast-index', 'ingested', language],
    genres: ['podcast'],
    region: inferRegion(language),
    country: 'Unknown',
    countryCode: '',
    externalUrls: {
      rss: feed,
      website: row.link ? String(row.link) : undefined,
      podcastIndex: `https://podcastindex.org/podcast/${row.id}`,
    },
    coverArt: row.imageUrl ? String(row.imageUrl) : undefined,
    signals: {
      popularity,
      diversity: diversityScore(language),
    },
    episodeCount: Number(row.episodeCount ?? 0) || undefined,
  };
}

async function fromPodcastIndexApi(limit: number): Promise<CatalogEntry[]> {
  const queries = loadQueries();
  const buckets = new Map<string, CatalogEntry[]>();
  for (const query of queries) {
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
  }
  return takeDiverse(buckets, limit);
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

async function fromItunesQueries(limit: number): Promise<CatalogEntry[]> {
  const queries = loadQueries();
  const buckets = new Map<string, CatalogEntry[]>();
  for (const query of queries) {
    const url = new URL('https://itunes.apple.com/search');
    url.searchParams.set('media', 'podcast');
    url.searchParams.set('entity', 'podcast');
    url.searchParams.set('country', query.country);
    url.searchParams.set('term', query.term);
    url.searchParams.set('limit', '25');
    const result = await fetchJson<{ results?: ItunesPodcast[] }>(url);
    if (!result.ok) {
      console.warn(
        `iTunes ${result.status} for ${query.country}/${query.term}`,
      );
      await sleep(400);
      continue;
    }
    const hits = result.data.results ?? [];
    console.log(
      `iTunes ${query.country}/${query.term}: ${hits.length} hits (${countItems(buckets)} mapped)`,
    );
    for (const item of hits) {
      const entry = mapItunes(item, query);
      if (!entry) continue;
      const list = buckets.get(query.language) ?? [];
      list.push(entry);
      buckets.set(query.language, list);
    }
    await sleep(160);
    if (countItems(buckets) >= limit * 3) break;
  }
  return takeDiverse(buckets, limit);
}

function countItems(buckets: Map<string, CatalogEntry[]>): number {
  return [...buckets.values()].reduce((sum, list) => sum + list.length, 0);
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
      popularity: 35,
      diversity: diversityScore(language),
    },
    episodeCount: item.trackCount,
  };
}

function genreSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function takeDiverse(
  buckets: Map<string, CatalogEntry[]>,
  limit: number,
): CatalogEntry[] {
  const languages = [...buckets.keys()].sort(
    (a, b) => diversityScore(b) - diversityScore(a),
  );
  const seen = new Set<string>();
  const out: CatalogEntry[] = [];
  let index = 0;
  while (out.length < limit) {
    let added = false;
    for (const language of languages) {
      const bucket = buckets.get(language) ?? [];
      const item = bucket[index];
      if (!item || seen.has(item.id)) continue;
      seen.add(item.id);
      out.push(item);
      added = true;
      if (out.length >= limit) break;
    }
    if (!added) break;
    index += 1;
  }
  return out;
}

function loadQueries(): QuerySpec[] {
  const file = path.join(
    process.cwd(),
    'data',
    'sources',
    'podcast-queries.json',
  );
  return JSON.parse(readFileSync(file, 'utf8')) as QuerySpec[];
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
