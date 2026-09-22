import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatClock, progressRatio, progressState } from './format';

describe('player format', () => {
  it('formats clock time', () => {
    assert.equal(formatClock(0), '0:00');
    assert.equal(formatClock(65), '1:05');
    assert.equal(formatClock(3723), '1:02:03');
  });

  it('marks in-progress and played episodes', () => {
    assert.equal(progressState(0, 1000), 'unplayed');
    assert.equal(progressState(20, 1000), 'in-progress');
    assert.equal(progressState(950, 1000), 'played');
    assert.equal(progressRatio(250, 1000), 0.25);
  });
});
