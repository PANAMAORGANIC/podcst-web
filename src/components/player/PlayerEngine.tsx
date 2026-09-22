'use client';

import { useEffect, useRef } from 'react';
import { currentPlayable, usePlayer } from '@/player/store';

export function PlayerEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastPersist = useRef(0);
  const item = usePlayer((state) => currentPlayable(state));
  const status = usePlayer((state) => state.status);
  const rate = usePlayer((state) => state.rate);
  const muted = usePlayer((state) => state.muted);
  const volume = usePlayer((state) => state.volume);
  const seekRequest = usePlayer((state) => state.seekRequest);
  const reportTime = usePlayer((state) => state.reportTime);
  const reportReady = usePlayer((state) => state.reportReady);
  const reportEnded = usePlayer((state) => state.reportEnded);
  const reportError = usePlayer((state) => state.reportError);
  const consumeSeek = usePlayer((state) => state.consumeSeek);
  const toggle = usePlayer((state) => state.toggle);
  const skip = usePlayer((state) => state.skip);
  const next = usePlayer((state) => state.next);
  const previous = usePlayer((state) => state.previous);
  const seek = usePlayer((state) => state.seek);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !item) return;
    if (item.kind !== 'audio' || !item.enclosureUrl) {
      audio.removeAttribute('src');
      audio.load();
      return;
    }
    if (audio.src !== item.enclosureUrl) {
      audio.src = item.enclosureUrl;
      audio.load();
    }
  }, [item]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !item || item.kind !== 'audio') return;
    audio.playbackRate = rate;
    audio.muted = muted;
    audio.volume = muted ? 0 : volume;
    if (status === 'playing' || status === 'loading') {
      void audio.play().catch((error: unknown) => {
        const name = error instanceof Error ? error.name : '';
        if (name === 'AbortError') return;
        reportError(
          'The browser blocked playback or the enclosure refused the stream.',
          true,
        );
      });
    } else {
      audio.pause();
    }
  }, [status, rate, muted, volume, item, reportError]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || seekRequest === null || item?.kind !== 'audio') return;
    try {
      audio.currentTime = seekRequest;
    } catch {
      // some streams reject early seeks; retry on canplay via reportReady
    }
    consumeSeek();
  }, [seekRequest, item, consumeSeek]);

  useEffect(() => {
    if (!item || typeof navigator === 'undefined' || !navigator.mediaSession) {
      return;
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title: item.title,
      artist: item.showTitle,
      album: 'World Audio Repository',
      artwork: item.artwork
        ? [{ src: item.artwork, sizes: '600x600', type: 'image/jpeg' }]
        : [],
    });
    navigator.mediaSession.playbackState =
      status === 'playing' ? 'playing' : 'paused';
    navigator.mediaSession.setActionHandler('play', () => toggle());
    navigator.mediaSession.setActionHandler('pause', () => toggle());
    navigator.mediaSession.setActionHandler('previoustrack', () => previous());
    navigator.mediaSession.setActionHandler('nexttrack', () => next());
    navigator.mediaSession.setActionHandler('seekbackward', () => skip(-15));
    navigator.mediaSession.setActionHandler('seekforward', () => skip(30));
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (typeof details.seekTime === 'number') seek(details.seekTime);
    });
    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('seekbackward', null);
      navigator.mediaSession.setActionHandler('seekforward', null);
      navigator.mediaSession.setActionHandler('seekto', null);
    };
  }, [item, status, toggle, previous, next, skip, seek]);

  return (
    // biome-ignore lint/a11y/useMediaCaption: publisher stream; captions stay at the source
    <audio
      ref={audioRef}
      className="player-audio"
      preload="metadata"
      onLoadedMetadata={(event) => {
        reportReady(event.currentTarget.duration || 0);
      }}
      onTimeUpdate={(event) => {
        const now = Date.now();
        if (now - lastPersist.current < 700) return;
        lastPersist.current = now;
        reportTime(
          event.currentTarget.currentTime,
          event.currentTarget.duration || 0,
        );
      }}
      onEnded={reportEnded}
      onError={() =>
        reportError(
          'This enclosure could not be streamed (403, CORS, or missing). Open it in the source.',
          true,
        )
      }
    />
  );
}
