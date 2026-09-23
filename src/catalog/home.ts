import { listFavoriteSeedIds, listSeedEntries } from '@/catalog/likes';
import { type CatalogRail, homeRails } from '@/catalog/rails';
import { exploreRate } from '@/catalog/random';
import { recommendRails } from '@/catalog/recommend';
import { getShelfCatalog } from '@/catalog/store';

export type HomePayload = {
  seedIds: string[];
  likedRails: CatalogRail[];
  rate: number;
  rails: CatalogRail[];
};

const HOME_TTL_MS = 60_000;
let cache: { at: number; data: HomePayload } | null = null;

/** Seed-shelf home. Never gunzips or scores the 120k ingest snapshot. */
export function buildHomePayload(): HomePayload {
  const shelf = getShelfCatalog();
  const seedIds = listFavoriteSeedIds();
  const likedRails = recommendRails(listSeedEntries(), shelf, 8);
  const rails = homeRails();
  return {
    seedIds,
    likedRails,
    rate: exploreRate(),
    rails,
  };
}

export function loadCachedHome(): HomePayload {
  if (cache && Date.now() - cache.at < HOME_TTL_MS) return cache.data;
  const data = buildHomePayload();
  cache = { at: Date.now(), data };
  return data;
}

export function resetHomeCache() {
  cache = null;
}
