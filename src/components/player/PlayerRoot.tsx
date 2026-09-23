'use client';

import { useEffect } from 'react';
import { usePlayer } from '@/player/store';
import { MiniPlayer } from './MiniPlayer';
import { NowPlayingSheet } from './NowPlayingSheet';
import { PlayerEngine } from './PlayerEngine';

export function PlayerRoot() {
  const hydrate = usePlayer((state) => state.hydrate);
  const hasQueue = usePlayer((state) => state.queue.length > 0);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    document.body.classList.toggle('has-player', hasQueue);
    return () => document.body.classList.remove('has-player');
  }, [hasQueue]);

  return (
    <>
      <PlayerEngine />
      <MiniPlayer />
      <NowPlayingSheet />
    </>
  );
}
