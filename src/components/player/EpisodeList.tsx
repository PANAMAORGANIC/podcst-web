'use client';

import { useEffect, useState } from 'react';
import { coverUrl } from '@/catalog/cover';
import type { CatalogEntry } from '@/catalog/types';
import { AskWar } from '@/components/AskWar';
import { ExternalIcon, PlayIcon, QueueIcon } from '@/components/Icons';
import {
  formatClock,
  formatPublished,
  progressRatio,
  progressState,
} from '@/player/format';
import { usePlayer } from '@/player/store';
import type { EpisodesResponse, Playable } from '@/player/types';

export function EpisodeList({ entry }: { entry: CatalogEntry }) {
  const [data, setData] = useState<EpisodesResponse | null>(null);
  const [failed, setFailed] = useState(false);
  const playItem = usePlayer((state) => state.playItem);
  const enqueue = usePlayer((state) => state.enqueue);
  const currentId = usePlayer((state) => state.queue[state.index]?.id);
  const progress = usePlayer((state) => state.progress);

  useEffect(() => {
    const controller = new AbortController();
    setFailed(false);
    void fetch(`/api/episodes/${encodeURIComponent(entry.id)}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error('failed');
        return response.json() as Promise<EpisodesResponse>;
      })
      .then(setData)
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, [entry.id]);

  if (failed) {
    return (
      <section className="episode-list">
        <h2>Episodes</h2>
        <p className="lede">
          Could not load episodes. Open the show in its source — we never host
          the file.
        </p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="episode-list">
        <h2>Episodes</h2>
        <p className="lede">Loading recent episodes from the publisher feed…</p>
      </section>
    );
  }

  if (!data.episodes.length) {
    return (
      <section className="episode-list">
        <h2>Episodes</h2>
        <p className="lede">{data.message ?? 'No playable episodes yet.'}</p>
      </section>
    );
  }

  return (
    <section className="episode-list">
      <header className="episode-list-header">
        <div>
          <h2>Episodes</h2>
          <p className="lede">
            {data.source === 'youtube'
              ? "Latest uploads from the channel's YouTube feed. We embed the watch page — never host the file."
              : 'Streamed from the publisher. We store metadata and the enclosure URL only — never the audio file.'}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => playItem(data.episodes[0], { queue: data.episodes })}
        >
          <PlayIcon />
          Play latest
        </button>
      </header>
      <ol className="episode-rows">
        {data.episodes.map((episode) => {
          const head = progress[episode.id];
          const mark = progressState(head?.currentTime, head?.duration);
          const ratio = progressRatio(head?.currentTime, head?.duration);
          return (
            <li
              key={episode.id}
              className={
                episode.id === currentId
                  ? 'episode-row is-current'
                  : 'episode-row'
              }
            >
              <div className="episode-copy">
                <p className="episode-title">{episode.title}</p>
                <p className="episode-meta">
                  {formatPublished(episode.publishedAt)}
                  {episode.durationSeconds
                    ? ` · ${formatClock(episode.durationSeconds)}`
                    : ''}
                  {episode.kind === 'youtube' ? ' · YouTube' : ''}
                  {mark === 'in-progress' ? ' · In progress' : ''}
                  {mark === 'played' ? ' · Played' : ''}
                </p>
                {mark !== 'unplayed' ? (
                  <span
                    className="episode-progress"
                    aria-hidden="true"
                    style={{ ['--progress' as string]: String(ratio) }}
                  />
                ) : null}
              </div>
              <div className="episode-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    playItem(withArtwork(episode, entry), {
                      queue: data.episodes.map((row) =>
                        withArtwork(row, entry),
                      ),
                    })
                  }
                >
                  <PlayIcon />
                  Play
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => enqueue(withArtwork(episode, entry))}
                >
                  <QueueIcon />
                  Queue
                </button>
                {episode.sourceUrl ? (
                  <a
                    className="btn"
                    href={episode.sourceUrl}
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    <ExternalIcon />
                    Source
                  </a>
                ) : null}
                <AskWar episode={withArtwork(episode, entry)} entry={entry} />
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function withArtwork(episode: Playable, entry: CatalogEntry): Playable {
  return {
    ...episode,
    artwork: episode.artwork || coverUrl(entry),
    showTitle: episode.showTitle || entry.title,
  };
}
