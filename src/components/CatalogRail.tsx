import Link from 'next/link';
import type { CatalogRail as Rail } from '@/catalog/rails';
import { CatalogCard } from './CatalogCard';

export function CatalogRail({
  rail,
  moreHref,
  moreLabel = 'See all',
}: {
  rail: Rail;
  moreHref?: string;
  moreLabel?: string;
}) {
  return (
    <section
      className="catalog-rail"
      id={rail.id}
      aria-labelledby={`rail-${rail.id}`}
    >
      <header className="rail-header">
        <div>
          <h2 id={`rail-${rail.id}`}>{rail.title}</h2>
          <p>{rail.lede}</p>
        </div>
        {moreHref ? (
          <Link className="rail-more" href={moreHref}>
            {moreLabel}
          </Link>
        ) : null}
      </header>
      <ul className="rail-track">
        {rail.items.map((entry) => (
          <li key={entry.id}>
            <CatalogCard entry={entry} />
          </li>
        ))}
      </ul>
    </section>
  );
}
