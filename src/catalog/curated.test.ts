import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GENERIC_DIRECTORY_RAIL_IDS } from './curated';
import { homeRails } from './rails';

describe('curated owner home', () => {
  it('does not list unrelated global genre rails', () => {
    const ids = homeRails().map((rail) => rail.id);
    for (const generic of GENERIC_DIRECTORY_RAIL_IDS) {
      assert.ok(!ids.includes(generic), `home still has ${generic}`);
    }
    assert.ok(
      ids.some(
        (id) =>
          ['for-you', 'explore', 'pins'].includes(id) ||
          id.startsWith('topic-'),
      ),
      `expected taste-derived rails, got ${ids.join(',')}`,
    );
    assert.ok(!ids.includes('beyond-charts'));
    assert.ok(!ids.includes('public-domain'));
    assert.ok(!ids.includes('global-south'));
  });
});
