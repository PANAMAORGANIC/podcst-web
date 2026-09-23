import { cachedRssEpisodes } from '@/player/feed';
import type { Playable } from '@/player/types';
import { EDITORIAL_RECIPES } from './editorial';
import { bundledFavoriteIds } from './favorites-data';
import { queryCatalog } from './query';
import type {
  SearchEpisodeHit,
  SearchShowHit,
  SearchThemeHit,
  WarSearchResult,
} from './search-types';
import { catalogRuntime, getSearchCatalog } from './store';
import type { CatalogEntry } from './types';

export type {
  SearchEpisodeHit,
  SearchShowHit,
  SearchTab,
  SearchThemeHit,
  WarSearchResult,
} from './search-types';
export { SEARCH_TABS } from './search-types';

const SHOW_SCAN_CAP = 8;
const EPISODE_FETCH_MS = 8_000;

export function boostSet(extra: string[] = []): Set<string> {
  return new Set([...bundledFavoriteIds(), ...extra.filter(Boolean)]);
}

export function searchShows(
  q: string,
  boost = boostSet(),
  limit = 24,
): { items: SearchShowHit[]; total: number } {
  const { items, total } = queryCatalog({
    q,
    sort: 'relevance',
    limit: Math.max(limit, 80),
  });
  const ranked = [...items].sort((a, b) => {
    const ba = boost.has(a.id) ? 1 : 0;
    const bb = boost.has(b.id) ? 1 : 0;
    return bb - ba;
  });
  return {
    total,
    items: ranked.slice(0, limit).map((item) => ({
      id: item.id,
      title: item.title,
      type: item.type,
      creators: item.creators,
      language: item.originalLanguage,
      tags: [...item.genres, ...item.tags].slice(0, 6),
      boosted: boost.has(item.id),
    })),
  };
}

export function searchThemes(q: string, limit = 16): SearchThemeHit[] {
  const term = q.trim().toLowerCase();
  if (term.length < 2) return [];
  const catalog = getSearchCatalog();
  const out: SearchThemeHit[] = [];
  const seen = new Set<string>();

  for (const recipe of EDITORIAL_RECIPES) {
    const hay = [recipe.label, ...recipe.tags, ...recipe.requireTopics]
      .join(' ')
      .toLowerCase();
    if (!hay.includes(term) && !recipe.tags.some((tag) => term.includes(tag))) {
      continue;
    }
    const count = catalog.filter((entry) =>
      entryMatchesTheme(entry, recipe.tags),
    ).length;
    seen.add(recipe.id);
    out.push({
      id: recipe.id,
      label: recipe.label,
      kind: 'rail',
      count,
      query: recipe.requireTopics[0] ?? recipe.tags[0] ?? recipe.label,
    });
  }

  const tagCounts = new Map<string, number>();
  for (const entry of catalog) {
    for (const tag of [...entry.tags, ...entry.genres]) {
      const key = tag.toLowerCase();
      if (key.includes(term) || (term.length >= 3 && term.includes(key))) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      }
    }
  }
  for (const [label, count] of [...tagCounts.entries()].sort(
    (a, b) => b[1] - a[1],
  )) {
    const id = `tag:${label}`;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({ id, label, kind: 'tag', count, query: label });
  }

  const topicHits = catalog.filter((entry) => entryHay(entry).includes(term));
  if (topicHits.length && !seen.has(`topic:${term}`)) {
    out.unshift({
      id: `topic:${term}`,
      label: q.trim(),
      kind: 'topic',
      count: topicHits.length,
      query: q.trim(),
    });
  }

  return out.slice(0, limit);
}

export function showsToScan(
  q: string,
  boost = boostSet(),
  cap = SHOW_SCAN_CAP,
): CatalogEntry[] {
  const catalog = getSearchCatalog().filter((entry) => entry.externalUrls.rss);
  const matched = new Set(
    queryCatalog({ q, sort: 'relevance', limit: cap }).items.map(
      (item) => item.id,
    ),
  );
  const picked: CatalogEntry[] = [];
  const seen = new Set<string>();
  for (const entry of catalog) {
    if (picked.length >= cap) break;
    if (!boost.has(entry.id) && !matched.has(entry.id)) continue;
    if (seen.has(entry.id)) continue;
    seen.add(entry.id);
    picked.push(entry);
  }
  if (picked.length < cap) {
    for (const entry of catalog) {
      if (picked.length >= cap) break;
      if (seen.has(entry.id)) continue;
      if (boost.has(entry.id) || matched.has(entry.id)) continue;
      seen.add(entry.id);
      picked.push(entry);
    }
  }
  return picked;
}

export function filterEpisodes(episodes: Playable[], q: string): Playable[] {
  const term = q.trim().toLowerCase();
  if (term.length < 2) return [];
  return episodes.filter((episode) => {
    const hay = [episode.title, episode.showTitle, episode.description ?? '']
      .join(' ')
      .toLowerCase();
    return hay.includes(term);
  });
}

export async function searchEpisodes(
  q: string,
  boost = boostSet(),
  limit = 20,
): Promise<SearchEpisodeHit[]> {
  const shows = showsToScan(q, boost);
  const lists = await Promise.all(
    shows.map((entry) =>
      cachedRssEpisodes(
        {
          id: entry.id,
          title: entry.title,
          artwork: entry.coverArt,
          rss: entry.externalUrls.rss,
        },
        { timeoutMs: EPISODE_FETCH_MS, limit: 40 },
      ),
    ),
  );
  const ranked = filterEpisodes(lists.flat(), q).sort((a, b) => {
    const ba = boost.has(a.showId) ? 1 : 0;
    const bb = boost.has(b.showId) ? 1 : 0;
    if (ba !== bb) return bb - ba;
    const ta = a.title.toLowerCase().startsWith(q.trim().toLowerCase()) ? 1 : 0;
    const tb = b.title.toLowerCase().startsWith(q.trim().toLowerCase()) ? 1 : 0;
    return tb - ta;
  });
  return ranked.slice(0, limit).map((episode) => ({
    id: episode.id,
    title: episode.title,
    showId: episode.showId,
    showTitle: episode.showTitle,
    kind: episode.kind,
    publishedAt: episode.publishedAt,
    durationSeconds: episode.durationSeconds,
    sourceUrl: episode.sourceUrl,
    artwork: episode.artwork,
    youtubeId: episode.youtubeId,
    enclosureUrl: episode.enclosureUrl,
    description: episode.description,
  }));
}

export async function searchWar(input: {
  q: string;
  boostIds?: string[];
  showLimit?: number;
  episodeLimit?: number;
  themeLimit?: number;
}): Promise<WarSearchResult> {
  const q = input.q.trim();
  const boost = boostSet(input.boostIds);
  const mode = catalogRuntime().intended === 'full' ? 'full' : 'seed';
  if (q.length < 2) {
    return {
      q,
      mode,
      shows: [],
      episodes: [],
      themes: [],
      totals: { shows: 0, episodes: 0, themes: 0 },
      hint: 'Type at least two letters. Try soil, compost, or Radio Semilla.',
    };
  }

  const shows = searchShows(q, boost, input.showLimit ?? 24);
  const themes = searchThemes(q, input.themeLimit ?? 16);
  const episodes = await searchEpisodes(q, boost, input.episodeLimit ?? 20);
  const hint =
    mode === 'seed'
      ? 'Searching the seed shelf and favorite feeds — not the full 120k ingest.'
      : undefined;

  return {
    q,
    mode,
    shows: shows.items,
    episodes,
    themes,
    totals: {
      shows: shows.total,
      episodes: episodes.length,
      themes: themes.length,
    },
    hint,
  };
}

function entryHay(entry: CatalogEntry): string {
  return [
    entry.title,
    entry.description,
    entry.creators.join(' '),
    entry.tags.join(' '),
    entry.genres.join(' '),
  ]
    .join(' ')
    .toLowerCase();
}

function entryMatchesTheme(entry: CatalogEntry, tags: string[]): boolean {
  const hay = entryHay(entry);
  return tags.some((tag) => hay.includes(tag.toLowerCase()));
}
