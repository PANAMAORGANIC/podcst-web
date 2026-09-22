import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildHomePayload } from './home';
import { getShelfCatalog } from './shelf';
import { getEntry } from './store';

describe('cached seed home', () => {
  it('builds rails only from the seed shelf', () => {
    const seedIds = new Set(getShelfCatalog().map((item) => item.id));
    const home = buildHomePayload();
    assert.ok(home.rails.length >= 2);
    assert.ok(home.seedIds.includes('it-1747339811'));
    assert.ok(home.seedIds.includes('it-1547894245'));
    for (const rail of [...home.rails, ...home.likedRails]) {
      for (const item of rail.items) {
        assert.ok(seedIds.has(item.id), `${rail.id} leaked ${item.id}`);
      }
    }
    const pins = home.rails.find((rail) => rail.id === 'pins');
    assert.ok(pins?.items.some((item) => /acres/i.test(item.title)));
    assert.ok(pins?.items.some((item) => /semilla/i.test(item.title)));
  });

  it('resolves owner hubs without the ingest snapshot', () => {
    const semilla = getEntry('it-1547894245');
    assert.equal(semilla?.title, 'Radio Semilla');
    assert.ok(semilla?.externalUrls.rss);
    assert.equal(getEntry('it-1747339811')?.title, 'The Acres U.S.A. Podcast');
  });
});
