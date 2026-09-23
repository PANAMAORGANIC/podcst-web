import { favoriteId } from '../../scripts/lib/favorites';
import { bundledFavoriteShows } from './favorites-data';
import { SEED_CATALOG } from './seed';
import type { CatalogEntry } from './types';

let cache: CatalogEntry[] | null = null;

function favoriteToEntry(show: {
  title: string;
  feedUrl: string;
  appleId?: number;
  artworkUrl?: string;
  language: string;
  creators?: string[];
  description?: string;
  tags?: string[];
  genres?: string[];
  region?: string;
  country?: string;
  countryCode?: string;
  website?: string;
}): CatalogEntry {
  const id = favoriteId(show);
  const appleId = show.appleId;
  return {
    id,
    type: 'podcast',
    title: show.title,
    originalLanguage: show.language,
    creators: show.creators ?? [],
    description: show.description ?? show.title,
    tags: show.tags ?? [],
    genres: show.genres ?? [],
    region: show.region ?? 'unknown',
    country: show.country ?? '',
    countryCode: show.countryCode ?? '',
    externalUrls: {
      rss: show.feedUrl,
      website: show.website,
      store: appleId
        ? `https://podcasts.apple.com/podcast/id${appleId}`
        : undefined,
    },
    coverArt: show.artworkUrl,
    signals: { popularity: 70, diversity: 40 },
  };
}

/** Seed + owner favorites. Never reads catalog.json.gz or the filesystem. */
export function buildShelfCatalog(): CatalogEntry[] {
  const byId = new Map<string, CatalogEntry>();
  for (const show of bundledFavoriteShows()) {
    const entry = favoriteToEntry(show);
    byId.set(entry.id, entry);
  }
  for (const item of SEED_CATALOG) {
    byId.set(item.id, item);
  }
  return [...byId.values()];
}

export function getShelfCatalog(): CatalogEntry[] {
  cache ??= buildShelfCatalog();
  return cache;
}

export function resetShelfCache() {
  cache = null;
}
