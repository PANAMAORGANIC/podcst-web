#!/usr/bin/env npx tsx

/**
 * Favorites ingest — owner RSS hubs and search-and-pin.
 * Fetches channel metadata only. Never downloads enclosures or media.
 */

import { createHash } from 'node:crypto';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import {
  clampSignal,
  diversityScore,
  inferCountryName,
  inferRegion,
  normalizeLanguage,
} from '../src/catalog/taxonomy';
import type { CatalogEntry } from '../src/catalog/types';
import {
  collectPins,
  type FavoritePin,
  type FavoriteShow,
  favoriteId,
  loadFavoritesFile,
  pickItunesHit,
  scoreItunesTitle,
} from './lib/favorites';
import { fetchJson, sleep } from './lib/http';
import { loadRssChannel, normalizeFeedUrl, type RssChannel } from './lib/rss';
import {
  ingestLimit,
  loadIngested,
  stripHtml,
  writeReceipt,
  writeSnapshot,
} from './lib/store';

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

interface PiFeed {
  id: number;
  title?: string;
  url?: string;
  originalUrl?: string;
  link?: string;
  description?: string;
  author?: string;
  image?: string;
  language?: string;
  episodeCount?: number;
}

async function main() {
  const started = Date.now();
  const expandLimit = ingestLimit(80);
  const expandOn = process.env.FAVORITES_EXPAND !== '0';
  const file = loadFavoritesFile();
  const pins = collectPins(file);
  const dumpPath = findDump();
  console.log('World Audio Repository — favorites ingest');
  console.log('RSS channel metadata only. No enclosures, no Castbox scrape.');
  console.log(
    `${file.shows.length} curated feeds · ${pins.length} pins · Pacifica expand ${expandOn ? `on (cap ${expandLimit})` : 'off'}.`,
  );

  const entries: CatalogEntry[] = [];
  const warnings: string[] = [];
  let rssNetwork = 0;
  let rssCache = 0;

  for (const show of file.shows) {
    const { channel, source } = await loadRssChannel(show.feedUrl);
    if (source === 'network') rssNetwork += 1;
    if (source === 'cache') rssCache += 1;
    if (source === 'none') {
      warnings.push(`rss-miss:${show.title}`);
      console.warn(`RSS unavailable for ${show.title}; using source card.`);
    }
    const pi = await enrichFromIndex(show.feedUrl, dumpPath);
    entries.push(mapShow(show, channel, pi));
    await sleep(160);
  }

  const pinEntries: CatalogEntry[] = [];
  for (const pin of pins) {
    const resolved = await resolvePin(pin, dumpPath);
    if (!resolved) {
      warnings.push(`pin-miss:${pin.title}`);
      console.warn(`Pin missed: ${pin.title}`);
      continue;
    }
    pinEntries.push(resolved);
    await sleep(180);
  }
  entries.push(...pinEntries);

  const hubEntries: CatalogEntry[] = [];
  if (expandOn) {
    const queries = file.hubs?.pacifica?.itunesQueries ?? [];
    console.log(
      `Pacifica / public-radio iTunes cards: ${queries.length} queries.`,
    );
    const seen = new Set(entries.map((item) => item.id));
    for (const query of queries) {
      const hits = await itunesSearch(query.term, query.country, 25);
      for (const hit of hits) {
        const mapped = mapItunes(hit, {
          language: query.language,
          region: query.region || inferRegion(query.language, query.country),
          tags: ['pacifica', 'public-radio', 'hub-expand'],
        });
        if (!mapped || seen.has(mapped.id)) continue;
        seen.add(mapped.id);
        hubEntries.push(mapped);
        if (hubEntries.length >= expandLimit) break;
      }
      await sleep(180);
      if (hubEntries.length >= expandLimit) break;
    }
    console.log(`Pacifica expand mapped ${hubEntries.length}.`);
  }
  entries.push(...hubEntries);

  const result = upsertFavorites(entries);
  const receipt = writeReceipt('favorites.receipt.json', {
    ok: true,
    sources: [
      'data/sources/favorites.json',
      'rss-hubs',
      expandOn ? 'itunes-pacifica-search' : null,
      dumpPath ? `podcast-index-dump:${dumpPath}` : null,
    ].filter(Boolean),
    curated: file.shows.length,
    pins: pins.map((pin) => pin.title),
    pinMapped: pinEntries.length,
    hubMapped: hubEntries.length,
    rssNetwork,
    rssCache,
    warnings,
    favorites: file.shows.map((show) => ({
      title: show.title,
      id: favoriteId(show),
      feedUrl: show.feedUrl,
    })),
    snapshotBytes: result.snapshot,
    elapsedMs: Date.now() - started,
    note: 'Idempotent. Castbox is not a source. Re-run uses cached RSS in .tmp/favorites-rss/.',
  });

  console.log(
    `Upserted ${entries.length} favorite rows (${result.added} added, ${result.updated} updated). Snapshot ${result.total}.`,
  );
  console.log(`Receipt: ${receipt}`);
}

function upsertFavorites(entries: CatalogEntry[]) {
  const incomingIds = new Set(entries.map((item) => item.id));
  const incomingFeeds = new Set(
    entries
      .map((item) => normalizeFeedUrl(item.externalUrls.rss))
      .filter(Boolean),
  );
  const byId = new Map<string, CatalogEntry>();
  for (const item of loadIngested()) {
    const feed = normalizeFeedUrl(item.externalUrls.rss);
    if (feed && incomingFeeds.has(feed) && !incomingIds.has(item.id)) {
      continue;
    }
    byId.set(item.id, item);
  }
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

function mapShow(
  show: FavoriteShow,
  channel: RssChannel | null,
  pi: PiFeed | null,
): CatalogEntry {
  const language = normalizeLanguage(
    channel?.language || show.language || pi?.language,
  );
  const title = show.title || channel?.title?.trim() || 'Untitled';
  const description = stripHtml(
    channel?.description || show.description || title,
  ).slice(0, 900);
  const creators =
    (channel?.author ? [channel.author] : undefined) ||
    show.creators ||
    (pi?.author ? [pi.author] : ['Unknown']);
  const countryCode = show.countryCode?.toUpperCase() || '';
  return {
    id: favoriteId({
      appleId: show.appleId,
      podcastIndexId: show.appleId ? undefined : pi?.id,
      feedUrl: show.feedUrl,
    }),
    type: 'podcast',
    title,
    originalLanguage: language,
    creators,
    description,
    tags: unique(['favorite', 'rss', show.hub, language, ...(show.tags ?? [])]),
    genres: show.genres?.length ? show.genres : ['podcast'],
    region: show.region || inferRegion(language, countryCode),
    country: show.country || inferCountryName(countryCode),
    countryCode,
    externalUrls: {
      rss: show.feedUrl,
      website: show.website || channel?.link || pi?.link,
      store: show.appleId
        ? `https://podcasts.apple.com/podcast/id${show.appleId}`
        : undefined,
      podcastIndex: pi
        ? `https://podcastindex.org/podcast/${pi.id}`
        : undefined,
    },
    coverArt: channel?.image || pi?.image,
    signals: {
      popularity: 78,
      diversity: diversityScore(language),
    },
    episodeCount: channel?.itemCount || pi?.episodeCount,
  };
}

function mapItunes(
  item: ItunesPodcast,
  extras: { language: string; region: string; tags: string[] },
): CatalogEntry | null {
  if (!item.collectionName || !item.feedUrl || !item.collectionId) return null;
  const language = normalizeLanguage(extras.language);
  return {
    id: `it-${item.collectionId}`,
    type: 'podcast',
    title: item.collectionName,
    originalLanguage: language,
    creators: [item.artistName || 'Unknown'],
    description: `${item.collectionName} — ${item.primaryGenreName ?? 'podcast'} from ${inferCountryName(item.country)}. Public-radio / Pacifica-adjacent card from Apple Search. Metadata only.`,
    tags: unique([
      'favorite',
      'itunes',
      language,
      ...extras.tags,
      ...(item.genres ?? []).slice(0, 3),
    ]),
    genres: item.genres?.slice(0, 3).map(genreSlug) ?? ['podcast'],
    region: extras.region,
    country: inferCountryName(item.country),
    countryCode: (item.country || 'US').slice(0, 2).toUpperCase(),
    externalUrls: {
      rss: item.feedUrl,
      store: item.collectionViewUrl,
    },
    coverArt: item.artworkUrl600 || item.artworkUrl100,
    signals: {
      popularity: clampSignal(
        42 + Math.min(30, Number(item.trackCount ?? 0) / 20),
      ),
      diversity: diversityScore(language),
    },
    episodeCount: item.trackCount,
  };
}

async function resolvePin(
  pin: FavoritePin,
  dumpPath: string | null,
): Promise<CatalogEntry | null> {
  if (pin.feedUrl) {
    const { channel } = await loadRssChannel(pin.feedUrl);
    const pi = await enrichFromIndex(pin.feedUrl, dumpPath);
    return mapShow(
      {
        title: pin.title,
        feedUrl: pin.feedUrl,
        appleId: pin.appleId,
        language: pin.language || 'en',
        hub: inferHub(pin.feedUrl),
        tags: ['pin'],
      },
      channel,
      pi,
    );
  }
  if (pin.appleId) {
    const looked = await itunesLookup(pin.appleId);
    if (looked) {
      return mapItunes(looked, {
        language: pin.language || 'en',
        region: inferRegion(pin.language || 'en', pin.country),
        tags: ['pin'],
      });
    }
  }
  const country = pin.country || 'us';
  const hits = await itunesSearch(pin.title, country, 8);
  const hit = pickItunesHit(pin.title, hits);
  if (hit) {
    return mapItunes(hit, {
      language: pin.language || 'en',
      region: inferRegion(pin.language || 'en', country),
      tags: ['pin'],
    });
  }
  const piHits = await podcastIndexSearch(pin.title);
  const pi = piHits.find(
    (item) => scorePiTitle(pin.title, item.title) >= 72 && item.url,
  );
  if (pi?.url) {
    const { channel } = await loadRssChannel(pi.url);
    return mapShow(
      {
        title: pin.title,
        feedUrl: pi.url,
        language: pin.language || pi.language || 'en',
        hub: inferHub(pi.url),
        tags: ['pin', 'podcast-index'],
        creators: pi.author ? [pi.author] : undefined,
        description: pi.description,
        website: pi.link,
      },
      channel,
      pi,
    );
  }
  return null;
}

function scorePiTitle(want: string, got?: string): number {
  return scoreItunesTitle(want, got);
}

async function enrichFromIndex(
  feedUrl: string,
  dumpPath: string | null,
): Promise<PiFeed | null> {
  const fromDump = dumpPath ? lookupDumpByFeed(dumpPath, feedUrl) : null;
  if (fromDump) return fromDump;
  return podcastIndexByFeed(feedUrl);
}

async function itunesSearch(
  term: string,
  country: string,
  limit: number,
): Promise<ItunesPodcast[]> {
  const url = new URL('https://itunes.apple.com/search');
  url.searchParams.set('media', 'podcast');
  url.searchParams.set('entity', 'podcast');
  url.searchParams.set('country', country);
  url.searchParams.set('term', term);
  url.searchParams.set('limit', String(limit));
  const result = await fetchJson<{ results?: ItunesPodcast[] }>(url);
  if (!result.ok) {
    console.warn(`iTunes search ${result.status} for ${country}/${term}`);
    return [];
  }
  return result.data.results ?? [];
}

async function itunesLookup(id: number): Promise<ItunesPodcast | null> {
  const url = new URL('https://itunes.apple.com/lookup');
  url.searchParams.set('id', String(id));
  url.searchParams.set('entity', 'podcast');
  const result = await fetchJson<{ results?: ItunesPodcast[] }>(url);
  if (!result.ok) return null;
  return result.data.results?.[0] ?? null;
}

async function podcastIndexByFeed(feedUrl: string): Promise<PiFeed | null> {
  const key = process.env.PODCASTINDEX_API_KEY?.trim();
  const secret = process.env.PODCASTINDEX_API_SECRET?.trim();
  if (!key || !secret) return null;
  const url = new URL(
    'https://api.podcastindex.org/api/1.0/podcasts/byfeedurl',
  );
  url.searchParams.set('url', feedUrl);
  const result = await fetchJson<{ feed?: PiFeed }>(url, {
    headers: podcastIndexHeaders(key, secret),
  });
  if (!result.ok) return null;
  return result.data.feed ?? null;
}

async function podcastIndexSearch(term: string): Promise<PiFeed[]> {
  const key = process.env.PODCASTINDEX_API_KEY?.trim();
  const secret = process.env.PODCASTINDEX_API_SECRET?.trim();
  if (!key || !secret) return [];
  const url = new URL('https://api.podcastindex.org/api/1.0/search/byterm');
  url.searchParams.set('q', term);
  url.searchParams.set('max', '8');
  const result = await fetchJson<{ feeds?: PiFeed[] }>(url, {
    headers: podcastIndexHeaders(key, secret),
  });
  if (!result.ok) return [];
  return result.data.feeds ?? [];
}

function podcastIndexHeaders(
  key: string,
  secret: string,
): Record<string, string> {
  const apiHeaderTime = Math.floor(Date.now() / 1000).toString();
  const authorization = createHash('sha1')
    .update(key + secret + apiHeaderTime)
    .digest('hex');
  return {
    'X-Auth-Key': key,
    'X-Auth-Date': apiHeaderTime,
    Authorization: authorization,
    'User-Agent': UA,
  };
}

function lookupDumpByFeed(dbPath: string, feedUrl: string): PiFeed | null {
  try {
    const { DatabaseSync } = require('node:sqlite') as {
      DatabaseSync: new (
        path: string,
        options?: { readOnly?: boolean },
      ) => {
        prepare: (sql: string) => {
          get: (...args: unknown[]) => Record<string, unknown> | undefined;
          all: (...args: unknown[]) => unknown[];
        };
        close: () => void;
      };
    };
    const db = new DatabaseSync(dbPath, { readOnly: true });
    const tables = db
      .prepare(`SELECT name FROM sqlite_master WHERE type = 'table'`)
      .all() as { name: string }[];
    const names = tables.map((row) => row.name);
    const table = names.includes('podcasts')
      ? 'podcasts'
      : names.includes('feeds')
        ? 'feeds'
        : null;
    if (!table) {
      db.close();
      return null;
    }
    const cols = (
      db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]
    ).map((row) => row.name);
    const pick = (want: string[]) =>
      cols.find((col) =>
        want.some((name) => name.toLowerCase() === col.toLowerCase()),
      );
    const urlCol = pick(['url', 'feedUrl']);
    const originalCol = pick(['originalUrl']);
    const titleCol = pick(['title']);
    if (!urlCol || !titleCol) {
      db.close();
      return null;
    }
    const where = originalCol
      ? `lower(${urlCol}) = lower(?) OR lower(${originalCol}) = lower(?)`
      : `lower(${urlCol}) = lower(?)`;
    const args = originalCol ? [feedUrl, feedUrl] : [feedUrl];
    const row = db
      .prepare(`SELECT * FROM ${table} WHERE ${where} LIMIT 1`)
      .get(...args);
    db.close();
    if (!row) return null;
    return {
      id: Number(row.id),
      title: String(row[titleCol] ?? ''),
      url: String(row[urlCol] ?? feedUrl),
      originalUrl: originalCol ? String(row[originalCol] ?? '') : undefined,
      link: row.link ? String(row.link) : undefined,
      description: row.description ? String(row.description) : undefined,
      author: String(row.itunesAuthor ?? row.author ?? ''),
      image: String(row.imageUrl ?? row.artwork ?? row.image ?? ''),
      language: row.language ? String(row.language) : undefined,
      episodeCount: Number(row.episodeCount ?? 0) || undefined,
    };
  } catch (error) {
    console.warn(
      `Dump feed lookup skipped: ${error instanceof Error ? error.message : error}`,
    );
    return null;
  }
}

function findDump(): string | null {
  const candidates = [process.env.PODCASTINDEX_DUMP_PATH, DEFAULT_DUMP].filter(
    Boolean,
  ) as string[];
  return (
    candidates.find((file) => existsSync(file) && statSync(file).size > 0) ??
    null
  );
}

function inferHub(feedUrl: string): FavoriteShow['hub'] {
  const host = (() => {
    try {
      return new URL(feedUrl).hostname.toLowerCase();
    } catch {
      return '';
    }
  })();
  if (host.includes('anchor.fm') || host.includes('podcasters.spotify')) {
    return 'anchor';
  }
  if (host.includes('soundcloud')) return 'soundcloud';
  if (host.includes('transistor.fm')) return 'transistor';
  if (host.includes('substack')) return 'substack';
  if (host.includes('podbean')) return 'podbean';
  if (host.includes('libsyn')) return 'libsyn';
  return 'rss';
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
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
