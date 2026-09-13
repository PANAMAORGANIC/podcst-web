#!/usr/bin/env npx tsx

/**
 * YouTube ingest — curated channel metadata, optionally enriched
 * with the YouTube Data API. Never downloads video or audio.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { diversityScore, normalizeLanguage } from '../src/catalog/taxonomy';
import type { CatalogEntry } from '../src/catalog/types';
import { fetchJson } from './lib/http';
import { ingestLimit, upsertCatalog, writeReceipt } from './lib/store';

interface ChannelSource {
  id: string;
  handle?: string;
  channelId?: string;
  title: string;
  language: string;
  creators: string[];
  description: string;
  tags: string[];
  genres: string[];
  region: string;
  country: string;
  countryCode: string;
  youtube: string;
  website?: string;
  english?: { title: string; description: string };
}

interface YoutubeSnippet {
  title?: string;
  description?: string;
  country?: string;
  defaultLanguage?: string;
  thumbnails?: { high?: { url?: string } };
}

async function main() {
  const limit = ingestLimit(200);
  const sources = loadSources().slice(0, limit);
  const key = process.env.YOUTUBE_API_KEY?.trim();
  console.log('World Audio Repository — YouTube ingest');
  console.log(
    key
      ? 'Enriching curated channels via YouTube Data API.'
      : 'No YOUTUBE_API_KEY. Ingesting curated metadata from data/sources/youtube-channels.json.',
  );

  const entries: CatalogEntry[] = [];
  let enriched = 0;
  for (const source of sources) {
    let snippet: YoutubeSnippet | null = null;
    if (key) {
      snippet = await fetchSnippet(source, key);
      if (snippet) enriched += 1;
    }
    entries.push(mapChannel(source, snippet));
  }

  const result = upsertCatalog(entries);
  const receipt = writeReceipt('youtube.receipt.json', {
    ok: true,
    source: key ? 'youtube-data-api+curated' : 'curated-json',
    mapped: entries.length,
    enriched,
    languages: [...new Set(entries.map((item) => item.originalLanguage))],
    ...result,
  });
  console.log(
    `Upserted ${entries.length} YouTube titles (${result.added} added, ${result.updated} updated, ${enriched} API-enriched).`,
  );
  console.log(`Receipt: ${receipt}`);
}

function loadSources(): ChannelSource[] {
  const file = path.join(
    process.cwd(),
    'data',
    'sources',
    'youtube-channels.json',
  );
  return JSON.parse(readFileSync(file, 'utf8')) as ChannelSource[];
}

function mapChannel(
  source: ChannelSource,
  snippet: YoutubeSnippet | null,
): CatalogEntry {
  const language = normalizeLanguage(
    snippet?.defaultLanguage ?? source.language,
  );
  return {
    id: source.id,
    type: 'youtube',
    title: snippet?.title || source.title,
    originalLanguage: language,
    creators: source.creators,
    description: snippet?.description || source.description,
    tags: [...source.tags, 'ingested', 'youtube', language],
    genres: source.genres,
    region: source.region,
    country: source.country,
    countryCode: source.countryCode,
    externalUrls: {
      youtube: source.youtube,
      website: source.website,
    },
    coverArt: snippet?.thumbnails?.high?.url,
    signals: {
      popularity: 50,
      diversity: diversityScore(language),
    },
    translations: source.english ? { en: source.english } : undefined,
  };
}

async function fetchSnippet(
  source: ChannelSource,
  key: string,
): Promise<YoutubeSnippet | null> {
  const url = new URL('https://www.googleapis.com/youtube/v3/channels');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('key', key);
  if (source.channelId) url.searchParams.set('id', source.channelId);
  else if (source.handle) url.searchParams.set('forHandle', source.handle);
  else return null;
  const result = await fetchJson<{ items?: { snippet?: YoutubeSnippet }[] }>(
    url,
  );
  if (!result.ok) {
    console.warn(`YouTube API ${result.status} for ${source.id}`);
    return null;
  }
  return result.data.items?.[0]?.snippet ?? null;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
