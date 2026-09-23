import { getLanguage } from '@/catalog/languages';
import { getRegion } from '@/catalog/regions';
import {
  CATALOG_TYPE_LABELS,
  type CatalogQuery,
  type CatalogSort,
  type CatalogType,
} from '@/catalog/types';

interface FilterBarProps {
  query: CatalogQuery;
  languages: string[];
  regions: string[];
  genres: string[];
  action?: string;
}

export function FilterBar({
  query,
  languages,
  regions,
  genres,
  action = '/browse',
}: FilterBarProps) {
  return (
    <form className="filter-bar" action={action} method="get">
      <div className="filter-field">
        <label htmlFor="filter-q">Search</label>
        <input
          id="filter-q"
          name="q"
          type="search"
          defaultValue={query.q ?? ''}
          placeholder="Title, creator, tag…"
        />
      </div>
      <div className="filter-field">
        <label htmlFor="filter-type">Type</label>
        <select id="filter-type" name="type" defaultValue={query.type ?? 'all'}>
          <option value="all">All types</option>
          {(Object.keys(CATALOG_TYPE_LABELS) as CatalogType[]).map((type) => (
            <option key={type} value={type}>
              {CATALOG_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-field">
        <label htmlFor="filter-language">Language</label>
        <select
          id="filter-language"
          name="language"
          defaultValue={query.language ?? ''}
        >
          <option value="">All languages</option>
          {languages.map((code) => (
            <option key={code} value={code}>
              {getLanguage(code).name}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-field">
        <label htmlFor="filter-region">Region</label>
        <select
          id="filter-region"
          name="region"
          defaultValue={query.region ?? ''}
        >
          <option value="">All regions</option>
          {regions.map((id) => (
            <option key={id} value={id}>
              {getRegion(id).name}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-field">
        <label htmlFor="filter-genre">Genre</label>
        <select id="filter-genre" name="genre" defaultValue={query.genre ?? ''}>
          <option value="">All genres</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {labelize(genre)}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-field">
        <label htmlFor="filter-sort">Sort</label>
        <select
          id="filter-sort"
          name="sort"
          defaultValue={query.sort ?? 'diversity'}
        >
          <option value="diversity">Diversity first</option>
          <option value="popularity">Popularity</option>
          <option value="title">Title</option>
          <option value="language">Language</option>
        </select>
      </div>
      <button type="submit" className="btn btn-primary">
        Apply
      </button>
    </form>
  );
}

function labelize(value: string) {
  return value
    .split('-')
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(' ');
}

export function parseBrowseQuery(
  searchParams: Record<string, string | string[] | undefined>,
): CatalogQuery {
  const read = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const type = read('type');
  const sort = read('sort') as CatalogSort | undefined;
  return {
    q: read('q'),
    type:
      type === 'podcast' || type === 'audiobook' || type === 'youtube'
        ? type
        : 'all',
    language: read('language') || undefined,
    region: read('region') || undefined,
    genre: read('genre') || undefined,
    sort: sort || 'diversity',
  };
}
