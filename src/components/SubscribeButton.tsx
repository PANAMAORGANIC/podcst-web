'use client';

import {
  useHydrateSubscriptions,
  useSubscriptions,
} from '@/subscriptions/useSubscriptions';
import { BookmarkIcon } from './Icons';

export function SubscribeButton({
  id,
  title,
  compact = false,
}: {
  id: string;
  title: string;
  compact?: boolean;
}) {
  useHydrateSubscriptions();
  const ids = useSubscriptions((state) => state.ids);
  const toggle = useSubscriptions((state) => state.toggle);
  const on = ids.includes(id);
  const label = on ? `Unsubscribe from ${title}` : `Subscribe to ${title}`;

  return (
    <button
      type="button"
      className={
        compact
          ? 'icon-btn subscribe-btn subscribe-btn-compact'
          : 'btn btn-ghost subscribe-btn'
      }
      aria-pressed={on}
      aria-label={label}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(id);
      }}
    >
      <BookmarkIcon filled={on} />
      {compact ? null : on ? 'Subscribed' : 'Subscribe'}
    </button>
  );
}
