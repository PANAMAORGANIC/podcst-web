import type { Metadata } from 'next';
import {
  listGenres,
  listLanguages,
  listRegions,
  queryCatalog,
} from '@/catalog/query';
import { CATALOG_TYPE_LABELS, type CatalogType } from '@/catalog/types';
import { FilterBar, parseBrowseQuery } from '@/components/FilterBar';
import { TranslatedGrid } from '@/components/TranslatedEntry';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const query = parseBrowseQuery(await searchParams);
  const type =
    query.type && query.type !== 'all'
      ? CATALOG_TYPE_LABELS[query.type as CatalogType]
      : 'Catalogue';
  return { title: query.q ? `Search: ${query.q}` : type };
}

export default async function BrowsePage({ searchParams }: PageProps) {
  const query = parseBrowseQuery(await searchParams);
  const result = queryCatalog(query);

  return (
    <div className="page-browse">
      <header className="page-header">
        <p className="eyebrow">Browse</p>
        <h1>Filter the repository</h1>
        <p className="lede">
          Search title, creator, tags, language, and type. Default sort prefers
          diversity over popularity.
        </p>
      </header>
      <FilterBar
        query={query}
        languages={listLanguages()}
        regions={listRegions()}
        genres={listGenres()}
      />
      <p className="result-count" role="status">
        {result.total} {result.total === 1 ? 'title' : 'titles'}
      </p>
      <TranslatedGrid items={result.items} />
    </div>
  );
}
