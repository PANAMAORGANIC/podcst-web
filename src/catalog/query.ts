import { matchSorter } from 'match-sorter';
import { getLanguage } from './languages';
import { getRegion } from './regions';
import { getCatalog } from './store';
import type {
  CatalogEntry,
  CatalogQuery,
  CatalogResult,
  CatalogSort,
} from './types';

function haystack(entry: CatalogEntry): string {
  const language = getLanguage(entry.originalLanguage);
  const region = getRegion(entry.region);
  const english = entry.translations?.en;
  return [
    entry.title,
    english?.title,
    entry.description,
    english?.description,
    entry.creators.join(' '),
    entry.tags.join(' '),
    entry.genres.join(' '),
    entry.type,
    language.name,
    language.nativeName,
    language.code,
    region.name,
    region.continent,
    entry.country,
    entry.countryCode,
  ]
    .filter(Boolean)
    .join(' \n ');
}

function matchesFilters(entry: CatalogEntry, query: CatalogQuery): boolean {
  if (query.type && query.type !== 'all' && entry.type !== query.type) {
    return false;
  }
  if (query.language && entry.originalLanguage !== query.language) {
    return false;
  }
  if (query.region && entry.region !== query.region) {
    return false;
  }
  if (query.genre && !entry.genres.includes(query.genre)) {
    return false;
  }
  return true;
}

function sortEntries(
  items: CatalogEntry[],
  sort: CatalogSort | undefined,
): CatalogEntry[] {
  const next = [...items];
  switch (sort) {
    case 'popularity':
      return next.sort((a, b) => b.signals.popularity - a.signals.popularity);
    case 'title':
      return next.sort((a, b) => a.title.localeCompare(b.title, 'en'));
    case 'language':
      return next.sort((a, b) =>
        getLanguage(a.originalLanguage).name.localeCompare(
          getLanguage(b.originalLanguage).name,
          'en',
        ),
      );
    case 'relevance':
      return next;
    default:
      return next.sort((a, b) => {
        const diversity = b.signals.diversity - a.signals.diversity;
        if (diversity !== 0) return diversity;
        return b.signals.popularity - a.signals.popularity;
      });
  }
}

export function queryCatalog(query: CatalogQuery = {}): CatalogResult {
  const catalog = getCatalog();
  const filtered = catalog.filter((entry) => matchesFilters(entry, query));
  const term = query.q?.trim();

  let items: CatalogEntry[];
  if (term) {
    items = matchSorter(filtered, term, {
      keys: [
        { key: 'title', threshold: matchSorter.rankings.CONTAINS },
        {
          key: (item: CatalogEntry) => item.translations?.en?.title ?? '',
          threshold: matchSorter.rankings.CONTAINS,
        },
        {
          key: (item: CatalogEntry) => item.creators.join(' '),
          threshold: matchSorter.rankings.CONTAINS,
        },
        {
          key: (item: CatalogEntry) => item.tags.join(' '),
          threshold: matchSorter.rankings.CONTAINS,
        },
        {
          key: (item: CatalogEntry) => getLanguage(item.originalLanguage).name,
          threshold: matchSorter.rankings.CONTAINS,
        },
        {
          key: (item: CatalogEntry) => item.type,
          threshold: matchSorter.rankings.CONTAINS,
        },
        { key: haystack, threshold: matchSorter.rankings.CONTAINS },
      ],
    });
  } else {
    items = sortEntries(filtered, query.sort ?? 'diversity');
  }

  const total = items.length;
  const offset = query.offset && query.offset > 0 ? query.offset : 0;
  const limit = query.limit;
  if (limit && limit > 0) {
    items = items.slice(offset, offset + limit);
  } else if (offset > 0) {
    items = items.slice(offset);
  }

  return { items, total };
}

export function relatedEntries(entry: CatalogEntry, limit = 6): CatalogEntry[] {
  return getCatalog()
    .filter((item) => item.id !== entry.id)
    .map((item) => {
      let score = 0;
      if (item.originalLanguage === entry.originalLanguage) score += 4;
      if (item.region === entry.region) score += 3;
      if (item.type === entry.type) score += 1;
      const sharedGenres = item.genres.filter((genre) =>
        entry.genres.includes(genre),
      ).length;
      const sharedTags = item.tags.filter((tag) =>
        entry.tags.includes(tag),
      ).length;
      score += sharedGenres * 2 + sharedTags;
      return { item, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.item.signals.diversity - a.item.signals.diversity;
    })
    .slice(0, limit)
    .map((row) => row.item);
}

export function listLanguages(): string[] {
  return [...new Set(getCatalog().map((item) => item.originalLanguage))].sort(
    (a, b) => getLanguage(a).name.localeCompare(getLanguage(b).name, 'en'),
  );
}

export function listRegions(): string[] {
  return [...new Set(getCatalog().map((item) => item.region))].sort((a, b) =>
    getRegion(a).name.localeCompare(getRegion(b).name, 'en'),
  );
}

export function listGenres(): string[] {
  return [...new Set(getCatalog().flatMap((item) => item.genres))].sort(
    (a, b) => a.localeCompare(b, 'en'),
  );
}
