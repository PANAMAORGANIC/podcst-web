import type { CatalogEntry } from '@/catalog/types';
import { CatalogCard } from './CatalogCard';

export function CatalogGrid({
  items,
  translated = false,
}: {
  items: CatalogEntry[];
  translated?: boolean;
}) {
  if (items.length === 0) {
    return (
      <p className="empty-state" role="status">
        No titles match these filters. Try another language, region, or clearing
        search.
      </p>
    );
  }

  return (
    <ul className="catalog-grid">
      {items.map((entry) => (
        <li key={entry.id}>
          <CatalogCard entry={entry} translated={translated} />
        </li>
      ))}
    </ul>
  );
}
