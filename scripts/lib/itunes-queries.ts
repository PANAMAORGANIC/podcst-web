import { readFileSync } from 'node:fs';
import path from 'node:path';

export interface QuerySpec {
  country: string;
  term: string;
  language: string;
  region: string;
  genreId?: number;
}

export interface StorefrontPack {
  country: string;
  language: string;
  region: string;
  terms: string[];
  genreIds?: number[];
}

export interface StorefrontFile {
  defaultGenreIds?: number[];
  storefronts?: StorefrontPack[];
}

export function loadItunesQueries(
  root = process.cwd(),
  focus: string[] = [],
): QuerySpec[] {
  const sources = path.join(root, 'data', 'sources');
  const languageFirst = JSON.parse(
    readFileSync(path.join(sources, 'podcast-queries.json'), 'utf8'),
  ) as QuerySpec[];
  const packs = JSON.parse(
    readFileSync(path.join(sources, 'itunes-storefronts.json'), 'utf8'),
  ) as StorefrontFile;
  const queries = expandItunesQueries(languageFirst, packs);
  if (!focus.includes('en') && !focus.includes('es')) return queries;
  const extra = JSON.parse(
    readFileSync(path.join(sources, 'itunes-focus-en-es.json'), 'utf8'),
  ) as StorefrontFile;
  return expandItunesQueries(queries, extra);
}

export function expandItunesQueries(
  languageFirst: QuerySpec[],
  packs: StorefrontFile,
): QuerySpec[] {
  const seen = new Set<string>();
  const out: QuerySpec[] = [];

  const add = (query: QuerySpec) => {
    const key = `${query.country}|${query.language}|${query.term}|${query.genreId ?? ''}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(query);
  };

  for (const query of languageFirst) add(query);

  const defaultGenres = packs.defaultGenreIds ?? [];
  for (const storefront of packs.storefronts ?? []) {
    for (const term of storefront.terms) {
      add({
        country: storefront.country,
        term,
        language: storefront.language,
        region: storefront.region,
      });
    }
    const genres = storefront.genreIds ?? defaultGenres;
    const genreTerm = storefront.terms[0] ?? 'podcast';
    for (const genreId of genres) {
      add({
        country: storefront.country,
        term: genreTerm,
        language: storefront.language,
        region: storefront.region,
        genreId,
      });
    }
  }

  return out;
}

export function itunesStorefronts(queries: QuerySpec[]): string[] {
  return [...new Set(queries.map((query) => query.country))].sort();
}
