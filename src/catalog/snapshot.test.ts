import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { loadSnapshot, snapshotFileStats } from './snapshot';

describe('catalog snapshot', () => {
  it('stats the gzip without parsing it', () => {
    const stats = snapshotFileStats();
    assert.equal(stats.gz, true);
    assert.ok(stats.gzBytes > 1_000_000);
  });

  it('loads the checked-in gzip or json snapshot', () => {
    const items = loadSnapshot();
    assert.ok(items.length >= 200);
    assert.ok(items.some((item) => item.id.startsWith('pi-')));
  });
});
