'use client';

import { useMemo, useState } from 'react';
import type { CatalogEntry } from '@/catalog/types';
import { CatalogGrid } from './CatalogGrid';
import { TranslateToggle } from './TranslateToggle';

export function TranslatedGrid({ items }: { items: CatalogEntry[] }) {
  const available = useMemo(
    () => items.some((item) => Boolean(item.translations?.en)),
    [items],
  );
  const [enabled, setEnabled] = useState(false);

  return (
    <div>
      <div className="toolbar">
        <TranslateToggle
          enabled={enabled}
          available={available}
          onToggle={() => setEnabled((value) => !value)}
        />
      </div>
      <CatalogGrid items={items} translated={enabled} />
    </div>
  );
}
