import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { emptyPersisted, parsePersisted } from './persist';
import { clampIndex, enqueueItem, moveItem, removeItem } from './queue';
import type { Playable } from './types';

const a: Playable = {
  id: 's:a',
  showId: 's',
  showTitle: 'Show',
  title: 'A',
  kind: 'audio',
  enclosureUrl: 'https://cdn.example.com/a.mp3',
};
const b: Playable = {
  ...a,
  id: 's:b',
  title: 'B',
  enclosureUrl: 'https://cdn.example.com/b.mp3',
};

describe('player queue helpers', () => {
  it('enqueues uniquely, removes, and reorders', () => {
    const queued = enqueueItem(enqueueItem([a], b), a);
    assert.deepEqual(
      queued.map((row) => row.id),
      ['s:a', 's:b'],
    );
    assert.deepEqual(
      removeItem(queued, 's:a').map((row) => row.id),
      ['s:b'],
    );
    assert.deepEqual(
      moveItem(queued, 1, 0).map((row) => row.id),
      ['s:b', 's:a'],
    );
    assert.equal(clampIndex(9, 2), 1);
  });

  it('round-trips persisted queue JSON', () => {
    const raw = JSON.stringify({
      ...emptyPersisted(),
      queue: [a, b],
      index: 1,
      rate: 1.5,
      progress: { 's:a': { currentTime: 40, duration: 100, updatedAt: 1 } },
    });
    const parsed = parsePersisted(raw);
    assert.equal(parsed.queue.length, 2);
    assert.equal(parsed.index, 1);
    assert.equal(parsed.rate, 1.5);
    assert.equal(parsed.progress['s:a']?.currentTime, 40);
    assert.equal(parsePersisted('not-json').queue.length, 0);
  });
});
