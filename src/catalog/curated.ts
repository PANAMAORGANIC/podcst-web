import { editorialRails } from '@/catalog/editorial';
import { exploreRail, forYouRail } from '@/catalog/for-you';
import { listSeedEntries } from '@/catalog/likes';
import type { CatalogRail } from '@/catalog/rails';

/** Generic world-directory shelves that must not appear on the owner home. */
export const GENERIC_DIRECTORY_RAIL_IDS = [
  'beyond-charts',
  'public-domain',
  'global-south',
  'fewer-records',
  'long-video',
] as const;

export function favoritePinsRail(limit = 8): CatalogRail {
  return {
    id: 'pins',
    title: 'Pinned favorites',
    lede: 'Radio Semilla, EcoJustice Radio, 632nm, Tangentially Speaking, Planet: Critical, The Great Simplification — the owner graph.',
    items: listSeedEntries().slice(0, limit),
  };
}

export function learnedTopicRails(topicCount = 3, limit = 8): CatalogRail[] {
  return editorialRails(topicCount, limit);
}

export function curatedHomeRails(): CatalogRail[] {
  return [
    forYouRail(8),
    favoritePinsRail(8),
    exploreRail(8),
    ...editorialRails(4, 8),
  ].filter((rail) => rail.items.length > 0);
}
