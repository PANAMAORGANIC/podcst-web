#!/usr/bin/env npx tsx

/**
 * Recommend ingest — related shows for liked / favorite seeds.
 * Podcast Index (API + dump neighbors) and Apple Search.
 * Metadata and feed links only. Never Castbox. Never enclosures.
 */

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
  type FavoriteShow,
  favoriteId,
  foldTitle,
  loadFavoritesFile,
  normalizeFeedUrl,
} from './lib/favorites';
import { fetchJson, sleep } from './lib/http';
import {
  type PiFeed,
  podcastIndexByFeed,
  podcastIndexByItunes,
  podcastIndexConfigured,
  podcastIndexRelated,
  podcastIndexSearch,
} from './lib/podcast-index';
import {
  ingestLimit,
  stripHtml,
  upsertCatalog,
  writeReceipt,
} from './lib/store';

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

async function main() {
  const started = Date.now();
  const perSeed = Math.min(40, ingestLimit(20));
  const file = loadFavoritesFile();
  const dumpPath = findDump();
  const itunesOn = process.env.ITUNES_HARVEST !== '0';
  console.log('World Audio Repository — recommend ingest');
  console.log(
    'Related cards from Podcast Index + Apple. Metadata only. No Castbox.',
  );
  console.log(
    `${file.shows.length} favorite seeds · ${perSeed} related per seed · iTunes ${itunesOn ? 'on' : 'off'} · PI API ${podcastIndexConfigured() ? 'on' : 'off (dump/Apple only)'}.`,
  );

  const entries: CatalogEntry[] = [];
  const warnings: string[] = [];
  const perSeedCounts: Record<string, number> = {};

  for (const show of file.shows) {
    const related: CatalogEntry[] = [];
    const seen = new Set<string>([favoriteId(show)]);

    if (podcastIndexConfigured()) {
      const pi =
        (show.appleId ? await podcastIndexByItunes(show.appleId) : null) ??
        (await podcastIndexByFeed(show.feedUrl));
      if (pi?.id) {
        for (const feed of await podcastIndexRelated(pi.id, perSeed)) {
          const mapped = mapPi(feed, show, ['recommend', 'podcast-index']);
          if (mapped && !seen.has(mapped.id) && !isSeedSelf(mapped, show)) {
            seen.add(mapped.id);
            related.push(mapped);
          }
        }
      }
      for (const term of relatedTerms(show)) {
        for (const feed of await podcastIndexSearch(term, 8)) {
          const mapped = mapPi(feed, show, ['recommend', 'podcast-index']);
          if (mapped && !seen.has(mapped.id) && !isSeedSelf(mapped, show)) {
            seen.add(mapped.id);
            related.push(mapped);
          }
        }
        await sleep(120);
      }
    }

    if (dumpPath) {
      for (const row of dumpNeighbors(dumpPath, show, perSeed)) {
        if (seen.has(row.id) || isSeedSelf(row, show)) continue;
        seen.add(row.id);
        related.push(row);
      }
    }

    if (itunesOn) {
      for (const query of itunesQueries(show)) {
        const hits = await itunesSearch(
          query.term,
          query.country,
          query.genreId,
        );
        for (const hit of hits) {
          const mapped = mapItunes(hit, show);
          if (!mapped || seen.has(mapped.id) || isSeedSelf(mapped, show)) {
            continue;
          }
          seen.add(mapped.id);
          related.push(mapped);
        }
        await sleep(180);
      }
    }

    const sliced = related.slice(0, perSeed);
    perSeedCounts[show.title] = sliced.length;
    entries.push(...sliced);
    console.log(`Related for ${show.title}: ${sliced.length}`);
  }

  const result = upsertCatalog(entries, { replaceFeeds: true });
  const receipt = writeReceipt('recommend.receipt.json', {
    ok: true,
    sources: [
      'data/sources/favorites.json',
      podcastIndexConfigured() ? 'podcast-index-api' : null,
      dumpPath ? `podcast-index-dump:${dumpPath}` : null,
      itunesOn ? 'itunes-search' : null,
    ].filter(Boolean),
    perSeed: perSeedCounts,
    mapped: entries.length,
    warnings,
    snapshotBytes: result.snapshot,
    elapsedMs: Date.now() - started,
    note: 'Idempotent. Seeds stay in favorites.json. No media files.',
  });
  console.log(
    `Upserted ${entries.length} related rows (${result.added} added, ${result.updated} updated). Snapshot ${result.total}.`,
  );
  console.log(`Receipt: ${receipt}`);
}

function isSeedSelf(entry: CatalogEntry, show: FavoriteShow): boolean {
  if (show.appleId && entry.id === `it-${show.appleId}`) return true;
  if (favoriteId(show) === entry.id) return true;
  if (
    normalizeFeedUrl(entry.externalUrls.rss) === normalizeFeedUrl(show.feedUrl)
  ) {
    return true;
  }
  return foldTitle(entry.title) === foldTitle(show.title);
}

function relatedTerms(show: FavoriteShow): string[] {
  const terms = [
    ...(show.relatedTerms ?? []),
    show.title,
    ...(show.creators ?? []).slice(0, 1),
  ];
  return [...new Set(terms.map((term) => term.trim()).filter(Boolean))].slice(
    0,
    4,
  );
}

function itunesQueries(show: FavoriteShow): {
  term: string;
  country: string;
  genreId?: number;
}[] {
  const countries = itunesCountries(show);
  const terms = relatedTerms(show);
  const queries: { term: string; country: string; genreId?: number }[] = [];
  for (const country of countries) {
    for (const term of terms.slice(0, 3)) {
      queries.push({ term, country });
    }
    for (const genreId of show.relatedGenreIds ?? []) {
      queries.push({ term: terms[0] ?? show.title, country, genreId });
    }
  }
  return queries.slice(0, 10);
}

function itunesCountries(show: FavoriteShow): string[] {
  const base = (show.countryCode || 'us').toLowerCase();
  if (show.language === 'es') {
    return unique([base === 'ec' ? 'mx' : base, 'es', 'mx', 'us']);
  }
  return unique([base, 'us', 'gb']);
}

async function itunesSearch(
  term: string,
  country: string,
  genreId?: number,
): Promise<ItunesPodcast[]> {
  const url = new URL('https://itunes.apple.com/search');
  url.searchParams.set('media', 'podcast');
  url.searchParams.set('entity', 'podcast');
  url.searchParams.set('country', country);
  url.searchParams.set('term', term);
  url.searchParams.set('limit', '15');
  if (genreId) url.searchParams.set('genreId', String(genreId));
  const result = await fetchJson<{ results?: ItunesPodcast[] }>(url);
  if (!result.ok) {
    console.warn(`iTunes ${result.status} for ${country}/${term}`);
    return [];
  }
  return result.data.results ?? [];
}

function mapItunes(
  item: ItunesPodcast,
  seed: FavoriteShow,
): CatalogEntry | null {
  if (!item.collectionName || !item.feedUrl || !item.collectionId) return null;
  const language = normalizeLanguage(seed.language);
  return {
    id: `it-${item.collectionId}`,
    type: 'podcast',
    title: item.collectionName,
    originalLanguage: language,
    creators: [item.artistName || 'Unknown'],
    description: `${item.collectionName} — ${item.primaryGenreName ?? 'podcast'} related to ${seed.title}. Apple Search metadata; open the RSS to listen.`,
    tags: unique([
      'recommend',
      'itunes',
      language,
      ...topicTags(item.collectionName),
      ...(item.genres ?? []).slice(0, 3),
    ]),
    genres: item.genres?.slice(0, 3).map(genreSlug) ??
      seed.genres ?? ['podcast'],
    region: seed.region || inferRegion(language, seed.countryCode),
    country: inferCountryName(item.country || seed.countryCode),
    countryCode: (item.country || seed.countryCode || 'US')
      .slice(0, 2)
      .toUpperCase(),
    externalUrls: {
      rss: item.feedUrl,
      store: item.collectionViewUrl,
    },
    coverArt: item.artworkUrl600 || item.artworkUrl100,
    signals: {
      popularity: clampSignal(
        36 + Math.min(28, Number(item.trackCount ?? 0) / 20),
      ),
      diversity: diversityScore(language),
    },
    episodeCount: item.trackCount,
  };
}

function mapPi(
  feed: PiFeed,
  seed: FavoriteShow,
  extraTags: string[],
): CatalogEntry | null {
  const rss = feed.url || feed.originalUrl;
  if (!rss || !feed.title) return null;
  const language = normalizeLanguage(feed.language || seed.language);
  const id = feed.itunesId
    ? `it-${feed.itunesId}`
    : feed.id
      ? `pi-${feed.id}`
      : null;
  if (!id) return null;
  const categories = feed.categories ? Object.values(feed.categories) : [];
  return {
    id,
    type: 'podcast',
    title: feed.title,
    originalLanguage: language,
    creators: feed.author ? [feed.author] : (seed.creators ?? ['Unknown']),
    description: stripHtml(feed.description || feed.title).slice(0, 800),
    tags: unique([
      ...extraTags,
      language,
      ...topicTags(feed.title),
      ...categories.slice(0, 3),
    ]),
    genres: categories.slice(0, 3).map(genreSlug).filter(Boolean).length
      ? categories.slice(0, 3).map(genreSlug)
      : (seed.genres ?? ['podcast']),
    region: seed.region || inferRegion(language, seed.countryCode),
    country: seed.country || inferCountryName(seed.countryCode),
    countryCode: seed.countryCode ?? '',
    externalUrls: {
      rss,
      website: feed.link,
      podcastIndex: `https://podcastindex.org/podcast/${feed.id}`,
      store: feed.itunesId
        ? `https://podcasts.apple.com/podcast/id${feed.itunesId}`
        : undefined,
    },
    coverArt: feed.image,
    signals: {
      popularity: 44,
      diversity: diversityScore(language),
    },
    episodeCount: feed.episodeCount,
  };
}

function dumpNeighbors(
  dbPath: string,
  show: FavoriteShow,
  limit: number,
): CatalogEntry[] {
  try {
    const { DatabaseSync } = require('node:sqlite') as {
      DatabaseSync: new (
        path: string,
        options?: { readOnly?: boolean },
      ) => {
        prepare: (sql: string) => {
          all: (...args: unknown[]) => Record<string, unknown>[];
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
      return [];
    }
    const cols = (
      db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]
    ).map((row) => row.name);
    const pick = (want: string[]) =>
      cols.find((col) =>
        want.some((name) => name.toLowerCase() === col.toLowerCase()),
      );
    const titleCol = pick(['title']);
    const urlCol = pick(['url', 'feedUrl']);
    const langCol = pick(['language', 'lang']);
    if (!titleCol || !urlCol) {
      db.close();
      return [];
    }
    const cat1 = pick(['category1']);
    const cat2 = pick(['category2']);
    const keywords = [
      show.title,
      ...(show.relatedTerms ?? []),
      ...(show.tags ?? []),
    ]
      .map((value) => value.toLowerCase())
      .filter((value) => value.length > 3)
      .slice(0, 6);
    const keywordClause =
      keywords.length === 0
        ? '1=1'
        : `(${keywords
            .slice(0, 4)
            .map(() =>
              cat1 && cat2
                ? `(lower(${titleCol}) LIKE ? OR lower(${cat1}) LIKE ? OR lower(${cat2}) LIKE ?)`
                : `lower(${titleCol}) LIKE ?`,
            )
            .join(' OR ')})`;
    const args: string[] = [];
    if (langCol) args.push(`${show.language}%`);
    for (const word of keywords.slice(0, 4)) {
      const like = `%${word}%`;
      if (cat1 && cat2) args.push(like, like, like);
      else args.push(like);
    }
    const langClause = langCol ? `lower(${langCol}) LIKE ?` : '1=1';
    const rows = db
      .prepare(
        `SELECT * FROM ${table}
         WHERE IFNULL(dead, 0) = 0
           AND ${titleCol} IS NOT NULL
           AND ${urlCol} IS NOT NULL
           AND ${langClause}
           AND ${keywordClause}
         LIMIT ?`,
      )
      .all(...args, limit * 2);
    db.close();
    const out: CatalogEntry[] = [];
    for (const row of rows) {
      const title = String(row[titleCol] ?? '').trim();
      const feed = String(row[urlCol] ?? '').trim();
      if (!title || !feed) continue;
      const language = normalizeLanguage(
        String((langCol ? row[langCol] : show.language) ?? show.language),
      );
      const id = row.id != null ? `pi-${row.id}` : null;
      if (!id) continue;
      out.push({
        id,
        type: 'podcast',
        title,
        originalLanguage: language,
        creators: row.itunesAuthor
          ? [String(row.itunesAuthor)]
          : (show.creators ?? ['Unknown']),
        description: stripHtml(String(row.description ?? title)).slice(0, 700),
        tags: unique([
          'recommend',
          'podcast-index',
          language,
          ...topicTags(title),
        ]),
        genres: show.genres ?? ['podcast'],
        region: show.region || inferRegion(language, show.countryCode),
        country: show.country || inferCountryName(show.countryCode),
        countryCode: show.countryCode ?? '',
        externalUrls: {
          rss: feed,
          podcastIndex: `https://podcastindex.org/podcast/${row.id}`,
        },
        coverArt: row.imageUrl ? String(row.imageUrl) : undefined,
        signals: {
          popularity: clampSignal(Number(row.popularityScore ?? 20) / 10),
          diversity: diversityScore(language),
        },
      });
    }
    return out.slice(0, limit);
  } catch (error) {
    console.warn(
      `Dump neighbors skipped: ${error instanceof Error ? error.message : error}`,
    );
    return [];
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

function topicTags(title: string): string[] {
  const text = foldTitle(title);
  const tags: string[] = [];
  if (/\b(climate|climatico)\b/.test(text)) tags.push('climate');
  if (/\b(semilla|semillas|seed|seeds)\b/.test(text)) tags.push('seeds');
  if (/\b(kpfk|kpfa|wbai|wpfw|kpft|pacifica)\b/.test(text)) {
    tags.push('pacifica', 'public-radio');
  }
  if (/\b(energy|energia)\b/.test(text)) tags.push('energy');
  if (/\becojustice\b/.test(text)) tags.push('ecojustice');
  return tags;
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
