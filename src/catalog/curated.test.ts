import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  GENERIC_DIRECTORY_RAIL_IDS,
  GENERIC_DIRECTORY_RAIL_TITLES,
  isGenericDirectoryRail,
} from './curated';
import { homeRails } from './rails';

describe('curated owner home', () => {
  it('does not list unrelated global genre rails', () => {
    const rails = homeRails();
    const ids = rails.map((rail) => rail.id);
    const titles = rails.map((rail) => rail.title.toLowerCase());
    for (const generic of GENERIC_DIRECTORY_RAIL_IDS) {
      assert.ok(!ids.includes(generic), `home still has ${generic}`);
    }
    for (const blocked of GENERIC_DIRECTORY_RAIL_TITLES) {
      assert.ok(
        !titles.some((title) => title.includes(blocked)),
        `home still has title ${blocked}`,
      );
    }
    assert.ok(
      ids.some(
        (id) =>
          ['for-you', 'explore', 'pins'].includes(id) ||
          id.startsWith('topic-') ||
          id.startsWith('editorial-') ||
          id.startsWith('learned-'),
      ),
      `expected taste-derived rails, got ${ids.join(',')}`,
    );
    assert.ok(!ids.some((id) => id.startsWith('genre-')));
    assert.ok(!ids.includes('beyond-charts'));
    assert.ok(!ids.includes('public-domain'));
    assert.ok(!ids.includes('global-south'));
  });

  it('pins Acres U.S.A. on the owner graph', () => {
    const pins = homeRails().find((rail) => rail.id === 'pins');
    assert.ok(pins);
    assert.ok(
      pins.items.some((item) => /acres/i.test(item.title)),
      `pins missing Acres, got ${pins.items.map((item) => item.title).join(', ')}`,
    );
    assert.match(pins.lede, /Acres/);
  });

  it('strips leftover marketing rails even if ids are renamed', () => {
    assert.equal(
      isGenericDirectoryRail({
        id: 'renamed-south',
        title: 'From the Global South',
      }),
      true,
    );
    assert.equal(
      isGenericDirectoryRail({
        id: 'editorial-acres-organic',
        title: 'Learned: organic / regenerative farming',
      }),
      false,
    );
  });
});
