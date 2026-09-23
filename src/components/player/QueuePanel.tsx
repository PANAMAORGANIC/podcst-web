'use client';

import { CloseIcon, PlayIcon } from '@/components/Icons';
import { formatClock } from '@/player/format';
import { usePlayer } from '@/player/store';

export function QueuePanel() {
  const open = usePlayer((state) => state.queueOpen);
  const queue = usePlayer((state) => state.queue);
  const index = usePlayer((state) => state.index);
  const playIndex = usePlayer((state) => state.playIndex);
  const remove = usePlayer((state) => state.remove);
  const move = usePlayer((state) => state.move);
  const clear = usePlayer((state) => state.clear);
  const toggleQueue = usePlayer((state) => state.toggleQueue);

  if (!open) return null;

  return (
    <aside className="queue-panel" aria-label="Play queue">
      <header className="queue-panel-header">
        <h2>Queue</h2>
        <div className="queue-panel-tools">
          {queue.length ? (
            <button type="button" className="btn" onClick={clear}>
              Clear
            </button>
          ) : null}
          <button
            type="button"
            className="icon-btn"
            onClick={toggleQueue}
            aria-label="Close queue"
          >
            <CloseIcon />
          </button>
        </div>
      </header>
      {queue.length === 0 ? (
        <p className="lede">
          Queue is empty. Add an episode from a title page.
        </p>
      ) : (
        <ol className="queue-rows">
          {queue.map((item, at) => (
            <li
              key={item.id}
              className={at === index ? 'queue-row is-current' : 'queue-row'}
            >
              <button
                type="button"
                className="queue-play"
                onClick={() => playIndex(at)}
              >
                <PlayIcon size={16} />
                <span>
                  <strong>{item.title}</strong>
                  <em>
                    {item.showTitle}
                    {item.durationSeconds
                      ? ` · ${formatClock(item.durationSeconds)}`
                      : ''}
                  </em>
                </span>
              </button>
              <div className="queue-row-tools">
                <button
                  type="button"
                  className="btn"
                  disabled={at === 0}
                  onClick={() => move(at, at - 1)}
                >
                  Up
                </button>
                <button
                  type="button"
                  className="btn"
                  disabled={at === queue.length - 1}
                  onClick={() => move(at, at + 1)}
                >
                  Down
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => remove(item.id)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}
