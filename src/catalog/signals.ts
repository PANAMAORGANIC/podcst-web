import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import {
  LIKED_FILE,
  listFavoriteSeedIds,
  readLikedFile,
} from '@/catalog/likes';
import { getCatalog } from '@/catalog/store';
import type { CatalogEntry } from '@/catalog/types';

export const SIGNALS_PATH = `${process.cwd()}/data/sources/user-signals.json`;
export const LIKES_RUNTIME_PATH = LIKED_FILE;

const DECAY = 0.92;
const MANUAL_CHANNEL_BOOST = 8;
const MANUAL_VIDEO_BOOST = 5;
const FAVORITE_BOOST = 3.2;
const LIKE_BOOST = 2.4;
const IMPORTED_BOOST = 1.8;

const SKIP_TAGS = new Set([
  'podcast',
  'youtube',
  'audiobook',
  'ingested',
  'recommend',
  'itunes',
  'favorite',
  'rss',
  'pin',
  'hub-expand',
  'podcast-index',
  'for-you',
  'anchor',
  'soundcloud',
  'transistor',
  'substack',
  'podbean',
  'libsyn',
  'spanish',
]);

export type UserSignals = {
  version: number;
  user: string;
  learnedAt: string | null;
  note?: string;
  sources: string[];
  youtubeChannelUrls: string[];
  youtubeVideoUrls: string[];
  importedYoutubeChannelIds: string[];
  importedYoutubeVideoIds: string[];
  weights: Record<string, number>;
};

export type YoutubeUrlSignal = {
  kind: 'channel' | 'video' | 'unknown';
  url: string;
  channelHandle?: string;
  channelId?: string;
  videoId?: string;
};

export function defaultSignals(): UserSignals {
  return {
    version: 1,
    user: 'RED',
    learnedAt: null,
    note: 'Learned from WAR likes, favorites, and optional YouTube Data API signals. Not a youtube.com homepage scrape.',
    sources: [],
    youtubeChannelUrls: [],
    youtubeVideoUrls: [],
    importedYoutubeChannelIds: [],
    importedYoutubeVideoIds: [],
    weights: {},
  };
}

export function loadUserSignals(): UserSignals {
  if (!existsSync(SIGNALS_PATH)) return defaultSignals();
  try {
    const parsed = JSON.parse(
      readFileSync(SIGNALS_PATH, 'utf8'),
    ) as UserSignals;
    return {
      ...defaultSignals(),
      ...parsed,
      youtubeChannelUrls: parsed.youtubeChannelUrls ?? [],
      youtubeVideoUrls: parsed.youtubeVideoUrls ?? [],
      importedYoutubeChannelIds: parsed.importedYoutubeChannelIds ?? [],
      importedYoutubeVideoIds: parsed.importedYoutubeVideoIds ?? [],
      weights: parsed.weights ?? {},
      sources: parsed.sources ?? [],
    };
  } catch {
    return defaultSignals();
  }
}

export function saveUserSignals(signals: UserSignals) {
  mkdirSync(`${process.cwd()}/data/sources`, { recursive: true });
  writeFileSync(SIGNALS_PATH, `${JSON.stringify(signals, null, 2)}\n`);
}

export function loadRuntimeLikedIds(): string[] {
  return readLikedFile();
}

export function parseYoutubeUrl(raw: string): YoutubeUrlSignal {
  const url = raw.trim();
  if (!url) return { kind: 'unknown', url };

  const watch = url.match(
    /(?:youtube\.com\/watch\?[^#]*v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/i,
  );
  if (watch?.[1]) return { kind: 'video', url, videoId: watch[1] };

  const channelId = url.match(/youtube\.com\/channel\/(UC[A-Za-z0-9_-]{20,})/i);
  if (channelId?.[1]) {
    return { kind: 'channel', url, channelId: channelId[1] };
  }

  const handle = url.match(/youtube\.com\/@([A-Za-z0-9._-]+)/i);
  if (handle?.[1]) {
    return { kind: 'channel', url, channelHandle: handle[1] };
  }

  const slash = url.match(/youtube\.com\/(?:c|user)\/([A-Za-z0-9._-]+)/i);
  if (slash?.[1]) {
    return { kind: 'channel', url, channelHandle: slash[1] };
  }

  return { kind: 'unknown', url };
}

export function matchYoutubeInCatalog(
  url: string,
  catalog: CatalogEntry[],
): CatalogEntry | undefined {
  const parsed = parseYoutubeUrl(url);
  const handle = parsed.channelHandle?.toLowerCase();
  const channelId = parsed.channelId?.toLowerCase();
  return catalog.find((item) => {
    if (item.type !== 'youtube') return false;
    const yt = (item.externalUrls.youtube ?? '').toLowerCase();
    if (!yt) return false;
    if (handle && yt.includes(`/@${handle}`)) return true;
    if (channelId && yt.includes(`/channel/${channelId}`)) return true;
    if (channelId && item.id.toLowerCase().includes(channelId)) return true;
    return yt === url.trim().toLowerCase();
  });
}

export function addYoutubeSignalUrl(raw: string): {
  signals: UserSignals;
  parsed: YoutubeUrlSignal;
} {
  const parsed = parseYoutubeUrl(raw);
  const signals = loadUserSignals();
  if (parsed.kind === 'channel') {
    if (!signals.youtubeChannelUrls.includes(parsed.url)) {
      signals.youtubeChannelUrls.push(parsed.url);
    }
    if (
      parsed.channelId &&
      !signals.importedYoutubeChannelIds.includes(parsed.channelId)
    ) {
      signals.importedYoutubeChannelIds.push(parsed.channelId);
    }
  } else if (parsed.kind === 'video') {
    if (!signals.youtubeVideoUrls.includes(parsed.url)) {
      signals.youtubeVideoUrls.push(parsed.url);
    }
    if (
      parsed.videoId &&
      !signals.importedYoutubeVideoIds.includes(parsed.videoId)
    ) {
      signals.importedYoutubeVideoIds.push(parsed.videoId);
    }
  }
  saveUserSignals(signals);
  return { signals, parsed };
}

export function bumpWeight(
  weights: Record<string, number>,
  key: string,
  amount: number,
) {
  const tag = key.trim().toLowerCase();
  if (!tag || SKIP_TAGS.has(tag)) return;
  if (/^[a-z]{2}$/.test(tag)) return;
  weights[tag] = Number(((weights[tag] ?? 0) + amount).toFixed(3));
}

export function addTitleSignals(
  weights: Record<string, number>,
  title: CatalogEntry | undefined,
  amount: number,
) {
  if (!title) return;
  for (const tag of title.tags) bumpWeight(weights, tag, amount);
  for (const genre of title.genres) {
    bumpWeight(weights, genre, amount * 0.7);
  }
  if (title.originalLanguage) {
    bumpWeight(weights, title.originalLanguage, amount * 0.35);
  }
}

export function tokensFromUrl(url: string): string[] {
  const parsed = parseYoutubeUrl(url);
  const raw = [
    parsed.channelHandle,
    parsed.channelId,
    parsed.videoId,
    ...url.split(/[/?&=._-]+/),
  ]
    .filter((part): part is string => Boolean(part))
    .map((part) => part.toLowerCase());
  const skip = new Set([
    'https',
    'http',
    'www',
    'com',
    'youtube',
    'watch',
    'channel',
    'youtu',
    'be',
  ]);
  return raw.filter((part) => part.length > 2 && !skip.has(part));
}

export function computeLearnedSignals(options: {
  previous: UserSignals;
  catalog: CatalogEntry[];
  favoriteIds: string[];
  likedIds: string[];
  extraTopics?: Record<string, number>;
  decay?: boolean;
  now?: Date;
}): UserSignals {
  const {
    previous,
    catalog,
    favoriteIds,
    likedIds,
    extraTopics = {},
    decay = true,
    now = new Date(),
  } = options;
  const byId = new Map(catalog.map((title) => [title.id, title]));
  const weights: Record<string, number> = {};
  for (const [key, value] of Object.entries(previous.weights)) {
    if (SKIP_TAGS.has(key) || /^[a-z]{2}$/.test(key)) continue;
    weights[key] = Number((value * (decay ? DECAY : 1)).toFixed(3));
  }

  const sources = new Set<string>();
  for (const id of favoriteIds) {
    addTitleSignals(weights, byId.get(id), FAVORITE_BOOST);
    sources.add('favorites');
  }
  for (const id of likedIds) {
    addTitleSignals(weights, byId.get(id), LIKE_BOOST);
    sources.add('likes');
  }

  for (const url of previous.youtubeChannelUrls) {
    const match = matchYoutubeInCatalog(url, catalog);
    if (match) addTitleSignals(weights, match, MANUAL_CHANNEL_BOOST);
    else {
      for (const token of tokensFromUrl(url)) {
        bumpWeight(weights, token, MANUAL_CHANNEL_BOOST * 0.15);
      }
    }
    bumpWeight(weights, 'lecture', MANUAL_CHANNEL_BOOST * 0.2);
    bumpWeight(weights, 'longform', MANUAL_CHANNEL_BOOST * 0.2);
    sources.add('manual-youtube-channel');
  }

  for (const url of previous.youtubeVideoUrls) {
    const match = matchYoutubeInCatalog(url, catalog);
    if (match) addTitleSignals(weights, match, MANUAL_VIDEO_BOOST);
    else {
      for (const token of tokensFromUrl(url)) {
        bumpWeight(weights, token, MANUAL_VIDEO_BOOST * 0.12);
      }
    }
    bumpWeight(weights, 'lecture', MANUAL_VIDEO_BOOST * 0.15);
    sources.add('manual-youtube-video');
  }

  for (const channelId of previous.importedYoutubeChannelIds) {
    bumpWeight(weights, 'imported-subscription', IMPORTED_BOOST);
    bumpWeight(weights, channelId.toLowerCase(), IMPORTED_BOOST * 0.2);
    sources.add('imported-youtube-channels');
  }
  if (previous.importedYoutubeVideoIds.length > 0) {
    bumpWeight(
      weights,
      'imported-like',
      IMPORTED_BOOST *
        0.8 *
        Math.min(8, previous.importedYoutubeVideoIds.length),
    );
    sources.add('imported-youtube-likes');
  }

  for (const [tag, amount] of Object.entries(extraTopics)) {
    bumpWeight(weights, tag, amount);
    sources.add('youtube-api-topics');
  }

  const cleaned: Record<string, number> = {};
  for (const [key, value] of Object.entries(weights)) {
    if (value >= 0.08) cleaned[key] = value;
  }

  return {
    ...previous,
    version: 1,
    learnedAt: now.toISOString(),
    sources: [...sources],
    weights: Object.fromEntries(
      Object.entries(cleaned).sort((a, b) => b[1] - a[1]),
    ),
  };
}

export function learnUserSignals(
  extraTopics: Record<string, number> = {},
  now = new Date(),
): UserSignals {
  const next = computeLearnedSignals({
    previous: loadUserSignals(),
    catalog: getCatalog(),
    favoriteIds: listFavoriteSeedIds(),
    likedIds: readLikedFile(),
    extraTopics,
    decay: true,
    now,
  });
  saveUserSignals(next);
  return next;
}

export function applyManualYoutubeSignal(raw: string): {
  signals: UserSignals;
  parsed: YoutubeUrlSignal;
} {
  const { parsed } = addYoutubeSignalUrl(raw);
  const next = computeLearnedSignals({
    previous: loadUserSignals(),
    catalog: getCatalog(),
    favoriteIds: listFavoriteSeedIds(),
    likedIds: readLikedFile(),
    decay: false,
    now: new Date(),
  });
  saveUserSignals(next);
  return { signals: next, parsed };
}

export function topWeightedTopics(
  signals: UserSignals,
  limit = 12,
): Array<{ topic: string; weight: number }> {
  return Object.entries(signals.weights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([topic, weight]) => ({ topic, weight }));
}

export function searchTermsFromWeights(
  signals: UserSignals,
  limit = 8,
): string[] {
  const skip = new Set([
    'en',
    'es',
    'imported-subscription',
    'imported-like',
    'uc',
    'society-culture',
    'news',
    ...SKIP_TAGS,
  ]);
  return topWeightedTopics(signals, 24)
    .map(({ topic }) => topic)
    .filter(
      (topic) =>
        !skip.has(topic) && topic.length > 2 && !topic.startsWith('uc'),
    )
    .slice(0, limit);
}
