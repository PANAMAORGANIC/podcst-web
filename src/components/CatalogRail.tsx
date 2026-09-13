import type { CatalogRail as Rail } from '@/catalog/rails';
import { CatalogCard } from './CatalogCard';

export function CatalogRail({ rail }: { rail: Rail }) {
  return (
    <section className="catalog-rail" aria-labelledby={`rail-${rail.id}`}>
      <header className="rail-header">
        <h2 id={`rail-${rail.id}`}>{rail.title}</h2>
        <p>{rail.lede}</p>
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
