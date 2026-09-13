import { exploreRail, forYouRail } from '@/catalog/for-you';
import { listSeedEntries } from '@/catalog/likes';
import type { CatalogRail } from '@/catalog/rails';
import {
  epsilonGreedySample,
  exploreRate,
  makeRng,
  requestExploreSeed,
} from '@/catalog/random';
import { loadUserSignals, topWeightedTopics } from '@/catalog/signals';
import { getCatalog } from '@/catalog/store';
import type { CatalogEntry } from '@/catalog/types';

/** Generic world-directory shelves that must not appear on the owner home. */
export const GENERIC_DIRECTORY_RAIL_IDS = [
  'beyond-charts',
  'public-domain',
  'global-south',
  'fewer-records',
  'long-video',
] as const;

const SKIP_TOPIC_RAILS = new Set([
  'society-culture',
  'news',
  'longform',
  'conversation',
  'imported-subscription',
  'imported-like',
]);

export function favoritePinsRail(limit = 8): CatalogRail {
  return {
    id: 'pins',
    title: 'Pinned favorites',
    lede: 'Radio Semilla, EcoJustice Radio, 632nm, Tangentially Speaking, Planet: Critical, The Great Simplification — the owner graph.',
    items: listSeedEntries().slice(0, limit),
  };
}

export function learnedTopicRails(topicCount = 3, limit = 8): CatalogRail[] {
  const signals = loadUserSignals();
  const catalog = getCatalog();
  const topics = topWeightedTopics(signals, 12)
    .map((row) => row.topic)
    .filter((topic) => !SKIP_TOPIC_RAILS.has(topic) && topic.length > 2)
    .slice(0, topicCount);
  const rate = exploreRate();
  const rails: CatalogRail[] = [];
  for (const topic of topics) {
    const matches = catalog.filter((item) => hasTopic(item, topic));
    if (matches.length < 3) continue;
    const ranked = [...matches].sort(
      (a, b) => b.signals.popularity - a.signals.popularity,
    );
    const items = epsilonGreedySample(
      ranked.slice(0, Math.max(limit * 6, 24)),
      limit,
      rate,
      makeRng(`${requestExploreSeed()}:${topic}`),
    );
    rails.push({
      id: `topic-${topic}`,
      title: `More ${topic}`,
      lede: `From your learned weights — related ${topic}, not a global genre directory.`,
      items,
    });
  }
  return rails;
}

function hasTopic(item: CatalogEntry, topic: string): boolean {
  const needle = topic.toLowerCase();
  return (
    item.tags.some((tag) => tag.toLowerCase() === needle) ||
    item.genres.some((genre) => genre.toLowerCase() === needle)
  );
}

export function curatedHomeRails(): CatalogRail[] {
  return [
    forYouRail(8),
    favoritePinsRail(8),
    exploreRail(8),
    ...learnedTopicRails(3, 8),
  ].filter((rail) => rail.items.length > 0);
}
