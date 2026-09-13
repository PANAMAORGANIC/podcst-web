'use client';

import { useHydrateLikes, useLikes } from '@/likes/useLikes';
import { HeartIcon } from './Icons';

export function LikeButton({
  id,
  title,
  seeds,
}: {
  id: string;
  title: string;
  seeds: string[];
}) {
  useHydrateLikes(seeds);
  const ids = useLikes((state) => state.ids);
  const toggle = useLikes((state) => state.toggle);
  const liked = ids.includes(id);

  return (
    <button
      type="button"
      className="btn btn-ghost like-btn"
      aria-pressed={liked}
      aria-label={liked ? `Unlike ${title}` : `Like ${title}`}
      onClick={() => toggle(id)}
    >
      <HeartIcon filled={liked} />
      {liked ? 'Liked' : 'Like this show'}
    </button>
  );
}
