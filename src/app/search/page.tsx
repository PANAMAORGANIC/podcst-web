import type { Metadata } from 'next';
import { SEARCH_TABS, type SearchTab } from '@/catalog/search-types';
import { SearchResults } from '@/components/SearchResults';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readTab(value: unknown): SearchTab {
  return SEARCH_TABS.includes(value as SearchTab)
    ? (value as SearchTab)
    : 'shows';
}

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
  const tab = readTab(params.tab);
  return <SearchResults q={q} tab={tab} />;
}
