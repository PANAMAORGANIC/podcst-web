import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  diversityScore,
  inferCountryName,
  inferRegion,
  normalizeLanguage,
} from '../../src/catalog/taxonomy';
import type { CatalogEntry } from '../../src/catalog/types';

export interface ChannelSource {
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

export interface YoutubeSnippet {
  title?: string;
  description?: string;
  country?: string;
  defaultLanguage?: string;
  thumbnails?: { high?: { url?: string }; medium?: { url?: string } };
}

export function loadYoutubeSources(root = process.cwd()): ChannelSource[] {
  const file = path.join(root, 'data', 'sources', 'youtube-channels.json');
  return JSON.parse(readFileSync(file, 'utf8')) as ChannelSource[];
}

export function topicTags(categories: string[] | undefined): string[] {
  return (categories ?? [])
    .map((url) => {
      const slug = url.split('/wiki/')[1] ?? '';
      return decodeURIComponent(slug)
        .replace(/_/g, '-')
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-|-$/g, '');
    })
    .filter((tag) => tag.length > 1 && tag.length < 40)
    .slice(0, 6);
}

export function mapYoutubeChannel(
  source: ChannelSource,
  snippet: YoutubeSnippet | null = null,
  topics: string[] = [],
): CatalogEntry {
  const language = normalizeLanguage(
    snippet?.defaultLanguage ?? source.language,
  );
  const countryCode = (
    snippet?.country ||
    source.countryCode ||
    ''
  ).toUpperCase();
  return {
    id: source.id,
    type: 'youtube',
    title: snippet?.title || source.title,
    originalLanguage: language,
    creators: source.creators,
    description: (snippet?.description || source.description).slice(0, 900),
    tags: unique([
      ...source.tags,
      ...topics,
      'ingested',
      'youtube',
      'longform',
      language,
    ]),
    genres: source.genres,
    region: source.region || inferRegion(language, countryCode),
    country: snippet?.country
      ? inferCountryName(snippet.country)
      : source.country,
    countryCode,
    externalUrls: {
      youtube: source.youtube,
      website: source.website,
    },
    coverArt:
      snippet?.thumbnails?.high?.url || snippet?.thumbnails?.medium?.url,
    signals: {
      popularity: 52,
      diversity: diversityScore(language),
    },
    translations: source.english ? { en: source.english } : undefined,
  };
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}
