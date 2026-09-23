import Link from 'next/link';
import type { CatalogEntry } from '@/catalog/types';
import { CoverArt } from './CoverArt';
import { SubscribeButton } from './SubscribeButton';

export function CatalogCard({
  entry,
  translated = false,
}: {
  entry: CatalogEntry;
  translated?: boolean;
}) {
  const title =
    translated && entry.translations?.en
      ? entry.translations.en.title
      : entry.title;
  const creators = entry.creators.filter(Boolean).join(', ');

  return (
    <article className="catalog-card">
      <Link href={`/title/${entry.id}`} className="catalog-card-link">
        <CoverArt entry={entry} alt={title} />
        <div className="catalog-card-body">
          <h3>{title}</h3>
          {creators ? (
            <p className="catalog-card-creators">{creators}</p>
          ) : null}
        </div>
      </Link>
      <SubscribeButton compact id={entry.id} title={title} />
    </article>
  );
}
