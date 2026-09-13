import type { Metadata } from 'next';
import { queryCatalog } from '@/catalog/query';
import { TranslatedGrid } from '@/components/TranslatedEntry';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q : '';
  return { title: q ? `Search: ${q}` : 'Search' };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q : '';
  const result = queryCatalog({ q, sort: 'relevance' });

  return (
    <div className="page-browse">
      <header className="page-header">
        <p className="eyebrow">Search</p>
        <h1>{q ? `Results for “${q}”` : 'Search the ingest pool'}</h1>
        <p className="lede">
          Matches title, creator, tags, language name, region, and type inside
          the backend catalogue. Your shelf is For You, not this list.
        </p>
      </header>
      <p className="result-count" role="status">
        {result.total} {result.total === 1 ? 'title' : 'titles'}
      </p>
      <TranslatedGrid items={result.items} />
    </div>
  );
}
