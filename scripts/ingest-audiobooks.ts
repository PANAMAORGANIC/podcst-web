#!/usr/bin/env npx tsx

/**
 * Audiobook ingest — LibriVox public-domain API + publisher metadata cards.
 * Deep links only. Never downloads or re-encodes audio.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  diversityScore,
  inferCountryName,
  inferRegion,
  normalizeLanguage,
} from '../src/catalog/taxonomy';
import type { CatalogEntry } from '../src/catalog/types';
import { fetchJson, sleep } from './lib/http';
import {
  ingestLimit,
  loadIngested,
  stripHtml,
  upsertCatalog,
  writeReceipt,
  writeSnapshot,
} from './lib/store';

const API = 'https://librivox.org/api/feed/audiobooks';
const PAGE = 50;

interface LibrivoxBook {
  id: string | number;
  title?: string;
  description?: string;
  language?: string;
  authors?: { first_name?: string; last_name?: string }[];
  url_librivox?: string;
  url_project?: string;
  url_iarchive?: string;
  totaltimesecs?: number | string;
  copyright_year?: string;
}

interface PublisherCard {
  id: string;
  title: string;
  language: string;
  creators: string[];
  description: string;
  tags: string[];
  genres: string[];
  region: string;
  country: string;
  countryCode: string;
  year?: number;
  store?: string;
  website?: string;
  english?: { title: string; description: string };
}

async function main() {
  const limit = ingestLimit(400);
  console.log('World Audio Repository — audiobook ingest');
  console.log('LibriVox API + publisher cards. No audio files.');

  const librivox = await fetchLibrivox(Math.max(limit - 20, 50));
  const publishers = loadPublisherCards();
  const entries = [...librivox, ...publishers];
  const result = upsertCatalog(entries);
  const scrubbed = scrubLegacyLanguages();
  const receipt = writeReceipt('audiobooks.receipt.json', {
    ok: true,
    source: ['librivox-api', 'publisher-cards'],
    limit,
    librivox: librivox.length,
    publishers: publishers.length,
    languages: [...new Set(librivox.map((item) => item.originalLanguage))],
    ...result,
    scrubbed,
  });
  console.log(
    `Upserted ${entries.length} audiobooks (${result.added} added, ${result.updated} updated).`,
  );
  console.log(`Receipt: ${receipt}`);
}

async function fetchLibrivox(limit: number): Promise<CatalogEntry[]> {
  const buckets = new Map<string, CatalogEntry[]>();
  let offset = 0;
  let empty = 0;
  const languagesWanted = 8;
  while (countItems(buckets) < limit * 2 && empty < 3 && offset < 2500) {
    const url = new URL(API);
    url.searchParams.set('format', 'json');
    url.searchParams.set('extended', '1');
    url.searchParams.set('limit', String(PAGE));
    url.searchParams.set('offset', String(offset));
    const result = await fetchJson<{ books?: LibrivoxBook[] }>(url, {
      timeoutMs: 30_000,
    });
    if (!result.ok) {
      console.warn(`LibriVox ${result.status} at offset ${offset}`);
      empty += 1;
      await sleep(500);
      continue;
    }
    const books = result.data.books ?? [];
    if (books.length === 0) {
      empty += 1;
    }
    for (const book of books) {
      const entry = mapLibrivox(book);
      if (!entry) continue;
      const list = buckets.get(entry.originalLanguage) ?? [];
      list.push(entry);
      buckets.set(entry.originalLanguage, list);
    }
    console.log(
      `LibriVox offset ${offset}: ${books.length} books, ${countItems(buckets)} mapped, ${buckets.size} languages`,
    );
    offset += PAGE;
    const enough =
      countItems(buckets) >= limit && buckets.size >= languagesWanted;
    if (enough || books.length < PAGE) break;
    await sleep(120);
  }
  return takeDiverse(buckets, limit);
}

function mapLibrivox(book: LibrivoxBook): CatalogEntry | null {
  const title = stripHtml(book.title);
  if (!title || !book.id) return null;
  const language = normalizeLanguage(book.language);
  if (language === 'mul') return null;
  const creators =
    book.authors
      ?.map((author) =>
        [author.first_name, author.last_name].filter(Boolean).join(' '),
      )
      .filter(Boolean) ?? [];
  const seconds = Number(book.totaltimesecs ?? 0);
  return {
    id: `lv-${book.id}`,
    type: 'audiobook',
    title,
    originalLanguage: language,
    creators: creators.length ? creators : ['LibriVox volunteers'],
    description:
      stripHtml(book.description) ||
      `${title} — public-domain LibriVox reading. Open LibriVox to listen; we do not host the file.`,
    tags: ['librivox', 'public-domain', 'ingested', language],
    genres: ['fiction', 'classics'],
    region: inferRegion(language),
    country: inferCountryName(),
    countryCode: '',
    externalUrls: {
      librivox: book.url_librivox,
      website: book.url_project || book.url_iarchive,
    },
    signals: {
      popularity: 40,
      diversity: diversityScore(language) + (language === 'en' ? 0 : 8),
    },
    year: book.copyright_year ? Number(book.copyright_year) : undefined,
    durationHours: seconds
      ? Math.max(1, Math.round(seconds / 3600))
      : undefined,
  };
}

function loadPublisherCards(): CatalogEntry[] {
  const file = path.join(
    process.cwd(),
    'data',
    'sources',
    'publisher-audiobooks.json',
  );
  const cards = JSON.parse(readFileSync(file, 'utf8')) as PublisherCard[];
  return cards.map((card) => ({
    id: card.id,
    type: 'audiobook' as const,
    title: card.title,
    originalLanguage: card.language,
    creators: card.creators,
    description: card.description,
    tags: [...card.tags, 'ingested', 'copyrighted'],
    genres: card.genres,
    region: card.region,
    country: card.country,
    countryCode: card.countryCode,
    externalUrls: {
      store: card.store,
      website: card.website,
    },
    signals: {
      popularity: 55,
      diversity: diversityScore(card.language),
    },
    year: card.year,
    translations: card.english ? { en: card.english } : undefined,
  }));
}

function scrubLegacyLanguages(): number {
  const items = loadIngested();
  const next = items.flatMap((item) => {
    const language = normalizeLanguage(item.originalLanguage);
    if (language === 'mul') return [];
    if (language === item.originalLanguage) return [item];
    return [
      {
        ...item,
        originalLanguage: language,
        region: inferRegion(language, item.countryCode),
      },
    ];
  });
  const removed = items.length - next.length;
  if (removed > 0 || next.some((item, index) => item !== items[index])) {
    writeSnapshot(next);
  }
  if (removed > 0) {
    console.log(`Removed ${removed} multilingual leftover rows.`);
  }
  return removed;
}

function countItems(buckets: Map<string, CatalogEntry[]>): number {
  return [...buckets.values()].reduce((sum, list) => sum + list.length, 0);
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
      const item = (buckets.get(language) ?? [])[index];
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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
