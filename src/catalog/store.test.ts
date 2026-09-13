import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SEED_CATALOG } from './seed';
import { catalogStats, getCatalog, getEntry, readIngested } from './store';

describe('catalog store', () => {
  it('keeps seed ids when they overlap ingested rows', () => {
    const seed = SEED_CATALOG[0];
    assert.ok(seed);
    const live = getEntry(seed.id);
    assert.equal(live?.title, seed.title);
  });

  it('merges ingested snapshot without duplicate ids', () => {
    const ingested = readIngested();
    const catalog = getCatalog();
    const ids = catalog.map((item) => item.id);
    assert.equal(new Set(ids).size, ids.length);
    if (ingested.length === 0) return;
    assert.ok(
      ingested.length >= 200,
      `expected a real ingest snapshot, got ${ingested.length}`,
    );
    assert.ok(catalog.length >= SEED_CATALOG.length);
    const stats = catalogStats();
    assert.ok(stats.types.podcast >= 50);
    assert.ok(stats.types.audiobook >= 20);
    assert.ok(stats.types.youtube >= 15);
    assert.ok(ingested.some((item) => item.id.startsWith('it-')));
    assert.ok(ingested.some((item) => item.id.startsWith('pi-')));
    assert.ok(ingested.some((item) => item.id.startsWith('lv-')));
    assert.ok(ingested.some((item) => item.id.startsWith('yt-')));
  });
});
