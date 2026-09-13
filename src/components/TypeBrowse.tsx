import {
  listGenres,
  listLanguages,
  listRegions,
  queryCatalog,
} from '@/catalog/query';
import type { CatalogType } from '@/catalog/types';
import { FilterBar } from '@/components/FilterBar';
import { TranslatedGrid } from '@/components/TranslatedEntry';

export function TypeBrowse({
  type,
  title,
  lede,
}: {
  type: CatalogType;
  title: string;
  lede: string;
}) {
  const result = queryCatalog({ type, sort: 'diversity' });
  return (
    <div className="page-browse">
      <header className="page-header">
        <p className="eyebrow">Collection</p>
        <h1>{title}</h1>
        <p className="lede">{lede}</p>
      </header>
      <FilterBar
        query={{ type, sort: 'diversity' }}
        languages={listLanguages()}
        regions={listRegions()}
        genres={listGenres()}
        action="/browse"
      />
      <p className="result-count" role="status">
        {result.total} titles · diversity first
      </p>
      <TranslatedGrid items={result.items} />
    </div>
  );
}
