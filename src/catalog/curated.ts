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

/** Titles from the old marketing home — strip even if an id is renamed. */
export const GENERIC_DIRECTORY_RAIL_TITLES = [
  'beyond the usual charts',
  'open voices',
  'from the global south',
  'languages with fewer records',
  'long-form on video',
] as const;

export function isGenericDirectoryRail(rail: {
  id: string;
  title: string;
}): boolean {
  if ((GENERIC_DIRECTORY_RAIL_IDS as readonly string[]).includes(rail.id)) {
    return true;
  }
  const title = rail.title.toLowerCase();
  return GENERIC_DIRECTORY_RAIL_TITLES.some(
    (blocked) => title === blocked || title.includes(blocked),
  );
}

export function favoritePinsRail(limit = 8): CatalogRail {
  return {
    id: 'pins',
    title: 'Pinned favorites',
    lede: 'Radio Semilla, EcoJustice Radio, 632nm, Tangentially Speaking, Planet: Critical, The Great Simplification, Acres U.S.A. — the owner graph.',
    items: listSeedEntries().slice(0, limit),
  };
}

export function learnedTopicRails(topicCount = 3, limit = 8): CatalogRail[] {
  return editorialRails(topicCount, limit);
}

export function curatedHomeRails(): CatalogRail[] {
  return [
    forYouRail(8),
    exploreRail(8),
    favoritePinsRail(8),
    ...editorialRails(5, 8),
  ].filter((rail) => rail.items.length > 0 && !isGenericDirectoryRail(rail));
}
