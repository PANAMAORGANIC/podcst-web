import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DEFAULT_EXPLORE_RATE,
  epsilonGreedySample,
  exploreRate,
  makeRng,
} from './random';

describe('explore rate knob', () => {
  it('defaults to ~0.2 and clamps', () => {
    assert.equal(exploreRate(''), DEFAULT_EXPLORE_RATE);
    assert.equal(exploreRate(undefined), DEFAULT_EXPLORE_RATE);
    assert.equal(exploreRate('0.15'), 0.15);
    assert.equal(exploreRate('2'), 1);
    assert.equal(exploreRate('-1'), 0);
  });
});

describe('epsilon-greedy sample', () => {
  it('explore rate 0 returns the greedy prefix', () => {
    const ranked = ['a', 'b', 'c', 'd', 'e', 'f'];
    assert.deepEqual(epsilonGreedySample(ranked, 3, 0, makeRng('any')), [
      'a',
      'b',
      'c',
    ]);
  });

  it('explore rate > 0 changes ordering across runs', () => {
    const ranked = Array.from({ length: 20 }, (_, index) => `item-${index}`);
    const orders = new Set<string>();
    for (const seed of ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8']) {
      orders.add(epsilonGreedySample(ranked, 8, 0.85, makeRng(seed)).join(','));
    }
    assert.ok(
      orders.size >= 2,
      `expected distinct orders, got ${[...orders].join(' | ')}`,
    );
  });
});
