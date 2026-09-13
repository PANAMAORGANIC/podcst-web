#!/usr/bin/env npx tsx

/**
 * YouTube ingest — curated long-form / podcast channels.
 * Metadata and channel URLs only. Never downloads video or audio.
 *
 * Without YOUTUBE_API_KEY: upsert every row in youtube-channels.json.
 * With a key: enrich snippet, country, and topicDetails from the Data API.
 */

import type { CatalogEntry } from '../src/catalog/types';
import { fetchJson, sleep } from './lib/http';
import { ingestLimit, upsertCatalog, writeReceipt } from './lib/store';
import {
  type ChannelSource,
  loadYoutubeSources,
  mapYoutubeChannel,
  topicTags,
  type YoutubeSnippet,
} from './lib/youtube';

interface YoutubeTopicDetails {
  topicCategories?: string[];
}

async function main() {
  const sources = loadYoutubeSources();
  const limit = ingestLimit(Math.max(800, sources.length));
  const selected = sources.slice(0, limit);
  const key = process.env.YOUTUBE_API_KEY?.trim();
  console.log('World Audio Repository — YouTube ingest');
  console.log('Channel metadata + YouTube links only. No video files.');
  console.log(
    key
      ? `Enriching ${selected.length} curated channels via YouTube Data API.`
      : `No YOUTUBE_API_KEY. Upserting ${selected.length} curated rows from data/sources/youtube-channels.json.`,
  );

  const entries: CatalogEntry[] = [];
  let enriched = 0;
  for (const source of selected) {
    let snippet: YoutubeSnippet | null = null;
    let topics: string[] = [];
    if (key) {
      const api = await fetchChannel(source, key);
      if (api?.snippet) {
        snippet = api.snippet;
        topics = topicTags(api.topicDetails?.topicCategories);
        enriched += 1;
      }
      await sleep(80);
    }
    entries.push(mapYoutubeChannel(source, snippet, topics));
  }

  const result = upsertCatalog(entries);
  const receipt = writeReceipt('youtube.receipt.json', {
    ok: true,
    source: key ? 'youtube-data-api+curated' : 'curated-json',
    mapped: entries.length,
    enriched,
    languages: [...new Set(entries.map((item) => item.originalLanguage))],
    en: entries.filter((item) => item.originalLanguage === 'en').length,
    es: entries.filter((item) => item.originalLanguage === 'es').length,
    ...result,
    note: 'Idempotent. Deep links only. Set YOUTUBE_API_KEY to enrich snippets and topics.',
  });
  console.log(
    `Upserted ${entries.length} YouTube titles (${result.added} added, ${result.updated} updated, ${enriched} API-enriched).`,
  );
  console.log(`Receipt: ${receipt}`);
}

async function fetchChannel(
  source: ChannelSource,
  key: string,
): Promise<{
  snippet?: YoutubeSnippet;
  topicDetails?: YoutubeTopicDetails;
} | null> {
  const url = new URL('https://www.googleapis.com/youtube/v3/channels');
  url.searchParams.set('part', 'snippet,topicDetails');
  url.searchParams.set('key', key);
  if (source.channelId) url.searchParams.set('id', source.channelId);
  else if (source.handle) url.searchParams.set('forHandle', source.handle);
  else return null;
  const result = await fetchJson<{
    items?: {
      snippet?: YoutubeSnippet;
      topicDetails?: YoutubeTopicDetails;
    }[];
  }>(url);
  if (!result.ok) {
    console.warn(`YouTube API ${result.status} for ${source.id}`);
    return null;
  }
  return result.data.items?.[0] ?? null;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
