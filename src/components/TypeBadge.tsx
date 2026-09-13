import { CATALOG_TYPE_LABELS, type CatalogType } from '@/catalog/types';

export function TypeBadge({ type }: { type: CatalogType }) {
  return (
    <span className={`type-badge type-${type}`}>
      {CATALOG_TYPE_LABELS[type]}
    </span>
  );
}
