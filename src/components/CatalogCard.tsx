import Link from 'next/link';
import { getLanguage } from '@/catalog/languages';
import { getRegion } from '@/catalog/regions';
import type { CatalogEntry } from '@/catalog/types';
import { CoverArt } from './CoverArt';
import { TypeBadge } from './TypeBadge';

export function CatalogCard({
  entry,
  translated = false,
}: {
  entry: CatalogEntry;
  translated?: boolean;
}) {
  const language = getLanguage(entry.originalLanguage);
  const region = getRegion(entry.region);
  const title =
    translated && entry.translations?.en
      ? entry.translations.en.title
      : entry.title;
  const description =
    translated && entry.translations?.en
      ? entry.translations.en.description
      : entry.description;

  return (
    <article className="catalog-card">
      <Link href={`/title/${entry.id}`} className="catalog-card-link">
        <CoverArt entry={entry} />
        <div className="catalog-card-body">
          <div className="catalog-card-meta">
            <TypeBadge type={entry.type} />
            <span>
              {language.name}
              {translated && entry.originalLanguage !== 'en' ? ' · EN' : ''}
            </span>
          </div>
          <h3>{title}</h3>
          <p className="catalog-card-creators">{entry.creators.join(', ')}</p>
          <p className="catalog-card-desc">{clamp(description, 140)}</p>
          <p className="catalog-card-region">{region.name}</p>
        </div>
      </Link>
    </article>
  );
}

function clamp(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}
