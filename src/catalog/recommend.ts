import type { CatalogRail } from './rails';
import type { CatalogEntry } from './types';

const NOISE_TAGS = new Set([
  'ingested',
  'itunes',
  'favorite',
  'rss',
  'pin',
  'podcast-index',
  'podcast',
  'podcasts',
  'recommend',
  'hub-expand',
  'en',
  'es',
  'fr',
  'de',
  'pt',
]);

export const HUB_NETWORKS: { id: string; tags: string[] }[] = [
  {
    id: 'pacifica',
    tags: [
      'pacifica',
      'kpfk',
      'kpfa',
      'wbai',
      'wpfw',
      'kpft',
      'public-radio',
      'ecojustice',
    ],
  },
  {
    id: 'climate',
    tags: [
      'climate',
      'ecology',
      'energy',
      'ecojustice',
      'planet-critical',
      'nate-hagens',
      'rachel-donald',
    ],
  },
  {
    id: 'science',
    tags: ['science', 'interviews', 'research'],
  },
  {
    id: 'conversation',
    tags: ['conversation', 'longform', 'christopher-ryan'],
  },
  {
    id: 'seeds',
    tags: ['seeds', 'agroecology', 'andes', 'red-de-guardianes', 'semillas'],
  },
];

export interface RecommendHit {
  item: CatalogEntry;
  score: number;
  reasons: string[];
}

export function meaningfulTags(tags: string[]): string[] {
  return tags.filter((tag) => {
    const folded = tag.toLowerCase();
    return folded.length > 1 && !NOISE_TAGS.has(folded);
  });
}

export function sharedHubNetworks(
  seed: CatalogEntry,
  item: CatalogEntry,
): string[] {
  const seedTags = new Set(
    [...seed.tags, ...seed.genres].map((tag) => tag.toLowerCase()),
  );
  const itemTags = new Set(
    [...item.tags, ...item.genres].map((tag) => tag.toLowerCase()),
  );
  return HUB_NETWORKS.filter((network) => {
    const inSeed = network.tags.some((tag) => seedTags.has(tag));
    const inItem = network.tags.some((tag) => itemTags.has(tag));
    return inSeed && inItem;
  }).map((network) => network.id);
}

export function scoreRecommendation(
  seed: CatalogEntry,
  item: CatalogEntry,
): RecommendHit {
  const reasons: string[] = [];
  let score = 0;
  const sameLanguage = item.originalLanguage === seed.originalLanguage;
  if (sameLanguage) {
    score += 48;
    reasons.push('language');
  } else if (seed.originalLanguage !== 'en' && item.originalLanguage === 'en') {
    score -= 14;
  } else {
    score += 6;
    reasons.push('other-language');
  }

  const seedGenres = new Set(seed.genres);
  const sharedGenres = item.genres.filter((genre) => seedGenres.has(genre));
  if (sharedGenres.length) {
    score += sharedGenres.length * 14;
    reasons.push('genre');
  }

  const seedTags = new Set(meaningfulTags(seed.tags));
  const sharedTags = meaningfulTags(item.tags).filter((tag) =>
    seedTags.has(tag),
  );
  if (sharedTags.length) {
    score += sharedTags.length * 8;
    reasons.push('tags');
  }

  if (item.region === seed.region) {
    score += 10;
    reasons.push('region');
  }
  if (
    seed.countryCode &&
    item.countryCode &&
    item.countryCode === seed.countryCode
  ) {
    score += 4;
  }

  const itemTitle = foldTitle(item.title);
  const titleHits = [...seedTags].filter((tag) => {
    const token = tag.replace(/-/g, ' ');
    return token.length > 3 && itemTitle.includes(token);
  });
  if (titleHits.length) {
    score += titleHits.length * 12;
    reasons.push('title');
  }

  const hubs = sharedHubNetworks(seed, item);
  if (hubs.length) {
    score += 22 + (hubs.length - 1) * 6;
    reasons.push(`hub:${hubs.join(',')}`);
  }

  if (item.type === seed.type) score += 6;

  score += item.signals.popularity * 0.12;
  score += item.signals.diversity * 0.22;

  return { item, score, reasons };
}

export function recommendFor(
  seed: CatalogEntry,
  catalog: CatalogEntry[],
  limit = 8,
): CatalogEntry[] {
  return recommendHits(seed, catalog, limit).map((hit) => hit.item);
}

export function recommendHits(
  seed: CatalogEntry,
  catalog: CatalogEntry[],
  limit = 8,
): RecommendHit[] {
  const seedTags = new Set(meaningfulTags(seed.tags));
  const seedGenres = new Set(seed.genres);
  const affinity: RecommendHit[] = [];
  const sameLanguageOnly: RecommendHit[] = [];

  const seedTitle = foldTitle(seed.title);

  for (const item of catalog) {
    if (item.id === seed.id) continue;
    if (foldTitle(item.title) === seedTitle) continue;
    if (item.type !== seed.type) continue;
    const sameLanguage = item.originalLanguage === seed.originalLanguage;
    const genreHit = item.genres.some((genre) => seedGenres.has(genre));
    const tagHit = meaningfulTags(item.tags).some((tag) => seedTags.has(tag));
    const sameRegion = item.region === seed.region;
    const hubHit = sharedHubNetworks(seed, item).length > 0;
    if (!sameLanguage && !genreHit && !tagHit && !sameRegion && !hubHit) {
      continue;
    }
    const close = genreHit || tagHit || hubHit || sameRegion;
    if (!close && sameLanguageOnly.length >= 400) continue;
    const hit = scoreRecommendation(seed, item);
    if (hit.score <= 0) continue;
    if (close) affinity.push(hit);
    else sameLanguageOnly.push(hit);
  }

  return [...affinity, ...sameLanguageOnly]
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.item.signals.diversity - a.item.signals.diversity;
    })
    .slice(0, limit);
}

export function recommendRails(
  seeds: CatalogEntry[],
  catalog: CatalogEntry[],
  limit = 8,
): CatalogRail[] {
  const used = new Set(seeds.map((seed) => seed.id));
  const rails: CatalogRail[] = [];
  for (const seed of seeds) {
    const items = recommendFor(seed, catalog, limit + 4)
      .filter((item) => !used.has(item.id))
      .slice(0, limit);
    for (const item of items) used.add(item.id);
    if (!items.length) continue;
    rails.push({
      id: `because-${seed.id}`,
      title: `Because you like ${seed.title}`,
      lede: sameLanguageLede(seed),
      items,
    });
  }
  return rails;
}

function foldTitle(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sameLanguageLede(seed: CatalogEntry): string {
  if (seed.originalLanguage !== 'en') {
    return `Same language and nearby genres first — not a US-only chart around ${seed.title}.`;
  }
  return `Shared language, tags, and hub or network peers, then popularity. Diversity still counts.`;
}
