#!/usr/bin/env npx tsx

/**
 * For You ingest — continuous learning from likes and YouTube signals.
 * Re-reads WAR likes + favorites, optionally YouTube Data API
 * (search with API key; subscriptions/likes with OAuth later).
 * Never scrapes youtube.com homepage or recommendation HTML.
 */

import { writeForYouSnapshot } from '../src/catalog/for-you';
import {
  learnUserSignals,
  loadUserSignals,
  saveUserSignals,
  searchTermsFromWeights,
} from '../src/catalog/signals';
import {
  clampSignal,
  diversityScore,
  inferCountryName,
  inferRegion,
  normalizeLanguage,
} from '../src/catalog/taxonomy';
import type { CatalogEntry } from '../src/catalog/types';
import { fetchJson, sleep } from './lib/http';
import { ingestLimit, upsertCatalog, writeReceipt } from './lib/store';
import {
  type ChannelSource,
  loadYoutubeSources,
  mapYoutubeChannel,
  topicTags,
} from './lib/youtube';
import {
  listChannelTopics,
  listMyLikedVideos,
  listMySubscriptions,
  readYoutubeOauthConfig,
  youtubeAccessToken,
} from './lib/youtube-oauth';

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

interface YoutubeSearchItem {
  id?: { channelId?: string };
  snippet?: {
    title?: string;
    description?: string;
    channelTitle?: string;
    thumbnails?: { high?: { url?: string }; medium?: { url?: string } };
  };
}

async function main() {
  const started = Date.now();
  const apiKey = process.env.YOUTUBE_API_KEY?.trim() ?? '';
  const itunesOn = process.env.ITUNES_HARVEST !== '0';
  const perTerm = Math.min(12, ingestLimit(8));

  console.log('World Audio Repository — For You ingest');
  console.log(
    'Learned from likes & YouTube API signals. Not a homepage scrape.',
  );

  const extraTopics: Record<string, number> = {};
  let oauthUsed = false;
  let importedChannels = 0;
  let importedVideos = 0;

  const oauth = readYoutubeOauthConfig();
  if (oauth) {
    const token = await youtubeAccessToken(oauth);
    if (token) {
      oauthUsed = true;
      const channelIds = await listMySubscriptions(token);
      const liked = await listMyLikedVideos(token);
      const signals = loadUserSignals();
      for (const id of channelIds) {
        if (!signals.importedYoutubeChannelIds.includes(id)) {
          signals.importedYoutubeChannelIds.push(id);
        }
      }
      for (const video of liked) {
        if (!signals.importedYoutubeVideoIds.includes(video.videoId)) {
          signals.importedYoutubeVideoIds.push(video.videoId);
        }
        if (
          video.channelId &&
          !signals.importedYoutubeChannelIds.includes(video.channelId)
        ) {
          signals.importedYoutubeChannelIds.push(video.channelId);
        }
        for (const tag of topicTags(video.topicCategories)) {
          extraTopics[tag] = (extraTopics[tag] ?? 0) + 1.6;
        }
      }
      importedChannels = channelIds.length;
      importedVideos = liked.length;
      saveUserSignals(signals);

      const topics = await listChannelTopics(
        [...channelIds, ...liked.map((video) => video.channelId ?? '')],
        apiKey,
        token,
      );
      for (const categories of Object.values(topics)) {
        for (const tag of topicTags(categories)) {
          extraTopics[tag] = (extraTopics[tag] ?? 0) + 2.2;
        }
      }
    } else {
      console.log(
        'OAuth env is set but the refresh token could not be exchanged.',
      );
    }
  } else if (apiKey) {
    console.log(
      'YOUTUBE_API_KEY is set. Public search will run. Private subscriptions/likes need OAuth later (see docs/youtube-signals.md).',
    );
  } else {
    console.log(
      'No YOUTUBE_API_KEY. Expanding from curated YouTube JSON + iTunes for top weights.',
    );
  }

  const signals = learnUserSignals(extraTopics);
  const terms = searchTermsFromWeights(signals, 8);
  console.log(
    `Learned ${Object.keys(signals.weights).length} topic weights. Top: ${terms.join(', ') || '(none yet)'}.`,
  );

  const entries: CatalogEntry[] = [];
  const sources = loadYoutubeSources();
  const topicSet = new Set(terms);
  const matching = sources.filter((source) =>
    [...source.tags, ...source.genres].some((tag) =>
      topicSet.has(tag.toLowerCase()),
    ),
  );
  for (const source of matching.slice(0, Math.max(80, matching.length))) {
    entries.push(mapYoutubeChannel(source));
  }

  let youtubeSearchHits = 0;
  if (apiKey && terms.length) {
    for (const term of terms.slice(0, 6)) {
      for (const language of ['en', 'es']) {
        const hits = await youtubeSearchChannels(apiKey, term, language);
        for (const hit of hits.slice(0, perTerm)) {
          const mapped = mapSearchChannel(hit, sources, term, language);
          if (mapped) entries.push(mapped);
        }
        youtubeSearchHits += hits.length;
        await sleep(120);
      }
    }
  }

  let itunesHits = 0;
  if (itunesOn && terms.length) {
    for (const term of terms.slice(0, 6)) {
      for (const country of itunesCountries(term)) {
        const hits = await itunesSearch(term, country);
        for (const hit of hits.slice(0, perTerm)) {
          const mapped = mapItunes(hit, term, country);
          if (mapped) entries.push(mapped);
        }
        itunesHits += hits.length;
        await sleep(180);
      }
    }
  }

  const unique = dedupeEntries(entries);
  const result = upsertCatalog(unique);
  const snapshot = writeForYouSnapshot();
  const receipt = writeReceipt('for-you.receipt.json', {
    ok: true,
    homepageScrape: false,
    learnedAt: signals.learnedAt,
    sources: signals.sources,
    LEARNED_TOPICS: Object.entries(signals.weights)
      .slice(0, 20)
      .map(([topic, weight]) => ({ topic, weight })),
    terms,
    youtubeMatched: matching.length,
    youtubeSearchHits,
    itunesHits,
    oauthUsed,
    importedChannels,
    importedVideos,
    mapped: unique.length,
    ...result,
    snapshotIds: snapshot.ids.length,
    elapsedMs: Date.now() - started,
    note: 'Weights update over time. Snapshot is data/for-you/latest.json.',
  });

  console.log(
    `Upserted ${unique.length} topic rows (${result.added} added, ${result.updated} updated). For You snapshot ${snapshot.ids.length} ids.`,
  );
  console.log(`Receipt: ${receipt}`);
}

async function youtubeSearchChannels(
  key: string,
  query: string,
  language: string,
): Promise<YoutubeSearchItem[]> {
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('type', 'channel');
  url.searchParams.set('q', query);
  url.searchParams.set('relevanceLanguage', language);
  url.searchParams.set('maxResults', '8');
  url.searchParams.set('key', key);
  const result = await fetchJson<{ items?: YoutubeSearchItem[] }>(url);
  if (!result.ok) {
    console.warn(`YouTube search ${result.status} for ${language}/${query}`);
    return [];
  }
  return result.data.items ?? [];
}

function mapSearchChannel(
  item: YoutubeSearchItem,
  sources: ChannelSource[],
  term: string,
  language: string,
): CatalogEntry | null {
  const channelId = item.id?.channelId;
  const title = item.snippet?.title;
  if (!channelId || !title) return null;
  const known = sources.find(
    (source) =>
      source.channelId === channelId ||
      source.youtube.includes(channelId) ||
      source.handle?.toLowerCase() === title.replace(/\s+/g, '').toLowerCase(),
  );
  if (known) return mapYoutubeChannel(known);
  const lang = normalizeLanguage(language);
  return {
    id: `yt-${channelId}`,
    type: 'youtube',
    title,
    originalLanguage: lang,
    creators: [item.snippet?.channelTitle || title],
    description: (item.snippet?.description || title).slice(0, 900),
    tags: uniqueTags(['for-you', 'youtube', 'longform', term, lang]),
    genres: ['ideas'],
    region: inferRegion(lang, ''),
    country: '',
    countryCode: '',
    externalUrls: {
      youtube: `https://www.youtube.com/channel/${channelId}`,
    },
    coverArt:
      item.snippet?.thumbnails?.high?.url ||
      item.snippet?.thumbnails?.medium?.url,
    signals: {
      popularity: 40,
      diversity: diversityScore(lang),
    },
  };
}

async function itunesSearch(
  term: string,
  country: string,
): Promise<ItunesPodcast[]> {
  const url = new URL('https://itunes.apple.com/search');
  url.searchParams.set('media', 'podcast');
  url.searchParams.set('entity', 'podcast');
  url.searchParams.set('country', country);
  url.searchParams.set('term', term);
  url.searchParams.set('limit', '12');
  const result = await fetchJson<{ results?: ItunesPodcast[] }>(url);
  if (!result.ok) {
    console.warn(`iTunes ${result.status} for ${country}/${term}`);
    return [];
  }
  return result.data.results ?? [];
}

function mapItunes(
  item: ItunesPodcast,
  term: string,
  country: string,
): CatalogEntry | null {
  if (!item.collectionName || !item.feedUrl || !item.collectionId) return null;
  const language = country === 'es' || country === 'mx' ? 'es' : 'en';
  return {
    id: `it-${item.collectionId}`,
    type: 'podcast',
    title: item.collectionName,
    originalLanguage: language,
    creators: [item.artistName || 'Unknown'],
    description: `${item.collectionName} — topic match for “${term}”. Apple Search metadata; open the RSS to listen.`,
    tags: uniqueTags([
      'for-you',
      'itunes',
      language,
      term,
      ...(item.genres ?? []).slice(0, 3),
    ]),
    genres: (item.genres ?? []).slice(0, 3).map(genreSlug).filter(Boolean)
      .length
      ? (item.genres ?? []).slice(0, 3).map(genreSlug)
      : ['podcast'],
    region: inferRegion(language, country),
    country: inferCountryName(item.country || country),
    countryCode: (item.country || country).slice(0, 2).toUpperCase(),
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

function itunesCountries(term: string): string[] {
  const spanish = /semilla|agroecologia|ecologia|climatico|justicia/.test(
    term.toLowerCase(),
  );
  return spanish ? ['mx', 'es', 'us'] : ['us', 'es', 'mx'];
}

function dedupeEntries(entries: CatalogEntry[]): CatalogEntry[] {
  const byId = new Map<string, CatalogEntry>();
  for (const entry of entries) byId.set(entry.id, entry);
  return [...byId.values()];
}

function uniqueTags(values: string[]): string[] {
  return [
    ...new Set(values.map((value) => value.toLowerCase()).filter(Boolean)),
  ];
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
