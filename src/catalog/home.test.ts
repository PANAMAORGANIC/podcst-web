import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildHomePayload } from './home';
import { SEED_CATALOG } from './seed';

describe('cached seed home', () => {
  it('builds rails only from the editorial seed', () => {
    const seedIds = new Set(SEED_CATALOG.map((item) => item.id));
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
  });
});
