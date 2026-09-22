'use client';

import { useEffect } from 'react';
import { create } from 'zustand';
import { SUBSCRIPTIONS_STORAGE_KEY } from '@/catalog/like-constants';

type SubscriptionsState = {
  ready: boolean;
  ids: string[];
  hydrate: () => void;
  toggle: (id: string) => void;
};

function readStored(): string[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(SUBSCRIPTIONS_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return unique(parsed.filter((id): id is string => typeof id === 'string'));
  } catch {
    return [];
  }
}

function persist(ids: string[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(ids));
}

export const useSubscriptions = create<SubscriptionsState>((set, get) => ({
  ready: false,
  ids: [],
  hydrate: () => {
    if (get().ready) return;
    set({ ready: true, ids: readStored() });
  },
  toggle: (id) => {
    if (!id) return;
    const on = get().ids.includes(id);
    const ids = on
      ? get().ids.filter((item) => item !== id)
      : unique([...get().ids, id]);
    set({ ids, ready: true });
    persist(ids);
  },
}));

export function useHydrateSubscriptions() {
  const hydrate = useSubscriptions((state) => state.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
}

export function unique(ids: string[]): string[] {
  return [...new Set(ids.filter(Boolean))];
}
