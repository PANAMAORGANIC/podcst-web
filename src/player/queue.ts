import type { Playable } from './types';

export function enqueueItem(queue: Playable[], item: Playable): Playable[] {
  if (queue.some((row) => row.id === item.id)) return queue;
  return [...queue, item];
}

export function removeItem(queue: Playable[], id: string): Playable[] {
  return queue.filter((row) => row.id !== id);
}

export function moveItem(
  queue: Playable[],
  from: number,
  to: number,
): Playable[] {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= queue.length ||
    to >= queue.length
  ) {
    return queue;
  }
  const next = [...queue];
  const [row] = next.splice(from, 1);
  next.splice(to, 0, row);
  return next;
}

export function clampIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return Math.min(Math.max(0, index), length - 1);
}
