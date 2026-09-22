import { listSeedEntries } from '@/catalog/likes';
import type { CatalogRail } from '@/catalog/rails';
import {
  type ExploreOptions,
  epsilonGreedySample,
  exploreRate,
  makeRng,
  neighborhoodSize,
  requestExploreSeed,
} from '@/catalog/random';
import { loadUserSignals, type UserSignals } from '@/catalog/signals';
import { getCatalog } from '@/catalog/store';
import type { CatalogEntry } from '@/catalog/types';

const MIN_WEIGHT = 0.8;
const SKIP_LEFTOVER = new Set([
  'society-culture',
  'news',
  'longform',
  'conversation',
  'imported-subscription',
  'imported-like',
]);

export type EditorialRecipe = {
  id: string;
  label: string;
  tags: string[];
  languages?: string[];
  requireTopics: string[];
  favoriteTitleIncludes?: string[];
};

/** Thematic shelves seeded by RED’s graph — not world-directory chrome. */
export const EDITORIAL_RECIPES: EditorialRecipe[] = [
  {
    id: 'climate-energy',
    label: 'climate / energy interviews',
    tags: [
      'climate',
      'energy',
      'ecology',
      'interviews',
      'planet-critical',
      'nate-hagens',
      'rachel-donald',
    ],
    requireTopics: ['climate', 'energy', 'ecology'],
    favoriteTitleIncludes: ['planet: critical', 'great simplification'],
  },
  {
    id: 'acres-organic',
    label: 'organic / regenerative farming',
    tags: [
      'acres',
      'organic',
      'farming',
      'soil',
      'agroecology',
      'regeneration',
    ],
    requireTopics: ['acres', 'organic', 'farming'],
    favoriteTitleIncludes: ['acres'],
  },
  {
    id: 'soil-regenerative',
    label: 'soil & regenerative (ES + EN)',
    tags: [
      'agroecology',
      'seeds',
      'semillas',
      'regeneration',
      'soil',
      'organic',
      'andes',
      'red-de-guardianes',
    ],
    languages: ['es', 'en'],
    requireTopics: ['agroecology', 'seeds', 'semillas', 'regeneration', 'soil'],
    favoriteTitleIncludes: ['radio semilla'],
  },
  {
    id: 'science-longform',
    label: 'science long-form',
    tags: ['science', 'interviews', 'research', 'lecture', 'longform'],
    requireTopics: ['science', 'interviews', 'research', 'lecture'],
    favoriteTitleIncludes: ['632nm'],
  },
  {
    id: 'spanish-regenerative',
    label: 'Spanish regenerative',
    tags: ['seeds', 'agroecology', 'semillas', 'andes', 'red-de-guardianes'],
    languages: ['es'],
    requireTopics: ['seeds', 'agroecology', 'semillas', 'andes'],
    favoriteTitleIncludes: ['radio semilla'],
  },
  {
    id: 'ecojustice',
    label: 'ecojustice',
    tags: ['ecojustice', 'pacifica', 'kpfk', 'public-radio'],
    requireTopics: ['ecojustice', 'pacifica', 'kpfk', 'public-radio'],
    favoriteTitleIncludes: ['ecojustice'],
  },
];

export function recipeIsActive(
  recipe: EditorialRecipe,
  signals: UserSignals,
  favorites: CatalogEntry[],
): boolean {
  if (
    recipe.requireTopics.some(
      (topic) => (signals.weights[topic] ?? 0) >= MIN_WEIGHT,
    )
  ) {
    return true;
  }
  return favorites.some((favorite) => favoriteMatchesRecipe(favorite, recipe));
}

function favoriteMatchesRecipe(
  favorite: CatalogEntry,
  recipe: EditorialRecipe,
): boolean {
  const title = favorite.title.toLowerCase();
  if (recipe.favoriteTitleIncludes?.some((needle) => title.includes(needle))) {
    return true;
  }
  const tags = new Set(
    [...favorite.tags, ...favorite.genres].map((tag) => tag.toLowerCase()),
  );
  return recipe.requireTopics.some((topic) => tags.has(topic));
}

function itemMatchesRecipe(
  item: CatalogEntry,
  recipe: EditorialRecipe,
): boolean {
  if (item.type === 'audiobook') return false;
  if (
    recipe.languages?.length &&
    !recipe.languages.includes(item.originalLanguage)
  ) {
    return false;
  }
  const tags = new Set(
    [...item.tags, ...item.genres].map((tag) => tag.toLowerCase()),
  );
  if (recipe.tags.some((tag) => tags.has(tag))) return true;
  if (!recipe.favoriteTitleIncludes?.length) return false;
  const hay = `${item.title} ${item.description}`.toLowerCase();
  return recipe.favoriteTitleIncludes.some((needle) => hay.includes(needle));
}

export function scoreEditorialItem(
  item: CatalogEntry,
  recipe: EditorialRecipe,
  signals: UserSignals,
): number {
  const tags = [...item.tags, ...item.genres].map((tag) => tag.toLowerCase());
  let score = 0;
  for (const tag of tags) {
    if (recipe.tags.includes(tag)) score += 3;
    score += signals.weights[tag] ?? 0;
  }
  if (item.originalLanguage === 'es' || item.originalLanguage === 'en') {
    score += 1.2;
  }
  if (item.type === 'youtube') score += 0.6;
  score += Math.min(2, Math.log10((item.signals.popularity ?? 0) + 10) / 2);
  return Number(score.toFixed(3));
}

function explainRail(
  recipe: EditorialRecipe,
  favorites: CatalogEntry[],
): { title: string; lede: string } {
  const seed =
    favorites.find((favorite) =>
      recipe.favoriteTitleIncludes?.some((needle) =>
        favorite.title.toLowerCase().includes(needle),
      ),
    ) ?? favorites.find((favorite) => favoriteMatchesRecipe(favorite, recipe));
  if (seed) {
    return {
      title: `Learned: ${recipe.label}`,
      lede: `Seeded by ${seed.title} and your learned weights. Related neighborhood from the ingest pool — not a genre directory.`,
    };
  }
  return {
    title: `Learned: ${recipe.label}`,
    lede: `From your learned topic weights — ${recipe.label}. Related finds, not a global genre directory.`,
  };
}

export function editorialRailsFrom(options: {
  catalog: CatalogEntry[];
  signals: UserSignals;
  favorites: CatalogEntry[];
  limit?: number;
  maxRails?: number;
  explore?: ExploreOptions;
}): CatalogRail[] {
  const limit = options.limit ?? 8;
  const maxRails = options.maxRails ?? 4;
  const rate = options.explore?.exploreRate ?? exploreRate();
  const used = new Set<string>();
  const rails: CatalogRail[] = [];
  const coveredTopics = new Set<string>();

  for (const recipe of EDITORIAL_RECIPES) {
    if (rails.length >= maxRails) break;
    if (!recipeIsActive(recipe, options.signals, options.favorites)) continue;
    const ranked = options.catalog
      .filter((item) => itemMatchesRecipe(item, recipe) && !used.has(item.id))
      .map((item) => ({
        item,
        score: scoreEditorialItem(item, recipe, options.signals),
      }))
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((row) => row.item);
    if (ranked.length < 3) continue;
    const seed =
      options.explore?.seed ?? `${requestExploreSeed()}:${recipe.id}`;
    const items = epsilonGreedySample(
      ranked.slice(0, neighborhoodSize(limit, options.explore?.neighborhood)),
      limit,
      rate,
      makeRng(seed),
    );
    if (!items.length) continue;
    for (const item of items) used.add(item.id);
    for (const topic of recipe.requireTopics) coveredTopics.add(topic);
    const copy = explainRail(recipe, options.favorites);
    rails.push({
      id: `editorial-${recipe.id}`,
      title: copy.title,
      lede: copy.lede,
      items,
    });
  }

  const leftover = Object.entries(options.signals.weights)
    .sort((a, b) => b[1] - a[1])
    .map(([topic]) => topic)
    .filter(
      (topic) =>
        !coveredTopics.has(topic) &&
        !SKIP_LEFTOVER.has(topic) &&
        topic.length > 2,
    )
    .slice(0, Math.max(0, maxRails - rails.length));

  for (const topic of leftover) {
    const ranked = options.catalog
      .filter((item) => {
        if (item.type === 'audiobook' || used.has(item.id)) return false;
        return (
          item.tags.some((tag) => tag.toLowerCase() === topic) ||
          item.genres.some((genre) => genre.toLowerCase() === topic)
        );
      })
      .sort((a, b) => b.signals.popularity - a.signals.popularity);
    if (ranked.length < 3) continue;
    const items = epsilonGreedySample(
      ranked.slice(0, neighborhoodSize(limit)),
      limit,
      rate,
      makeRng(options.explore?.seed ?? `${requestExploreSeed()}:${topic}`),
    );
    for (const item of items) used.add(item.id);
    rails.push({
      id: `learned-${topic}`,
      title: `Learned: ${topic}`,
      lede: `From LEARNED_TOPICS — related ${topic}, not a global genre shelf.`,
      items,
    });
  }

  return rails;
}

export function editorialRails(maxRails = 4, limit = 8): CatalogRail[] {
  return editorialRailsFrom({
    catalog: getCatalog(),
    signals: loadUserSignals(),
    favorites: listSeedEntries(),
    maxRails,
    limit,
  });
}
