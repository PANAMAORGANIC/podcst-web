'use client';

import { useEffect, useState } from 'react';
import {
  fromPublicCatalogItem,
  type PublicCatalogItem,
} from '@/catalog/public';
import type { CatalogEntry } from '@/catalog/types';
import {
  useHydrateSubscriptions,
  useSubscriptions,
} from '@/subscriptions/useSubscriptions';
import { CatalogGrid } from './CatalogGrid';

export function LibraryShelf() {
  useHydrateSubscriptions();
  const ready = useSubscriptions((state) => state.ready);
  const ids = useSubscriptions((state) => state.ids);
  const [items, setItems] = useState<CatalogEntry[]>([]);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!ids.length) {
      setItems([]);
      setPending(false);
      return;
    }
    const controller = new AbortController();
    setPending(true);
    void fetch(`/api/catalog?ids=${encodeURIComponent(ids.join(','))}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error('failed');
        return response.json() as Promise<{ items?: PublicCatalogItem[] }>;
      })
      .then((data) => {
        const resolved = (data.items ?? []).map(fromPublicCatalogItem);
        const order = new Map(ids.map((id, index) => [id, index]));
        resolved.sort(
          (a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99),
        );
        setItems(resolved);
        setPending(false);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setItems([]);
          setPending(false);
        }
      });
    return () => controller.abort();
  }, [ids, ready]);

  if (ready && pending) {
    return (
      <p className="lede" role="status">
        Loading your shelf from this device…
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="empty-state" role="status">
        Nothing on your shelf yet. Subscribe to a show on its title page — we
        keep the list on this phone only. <a href="/">Back to the library</a>
        {' · '}
        <a href="/explore">Explore</a>
      </p>
    );
  }

  return <CatalogGrid items={items} />;
}
