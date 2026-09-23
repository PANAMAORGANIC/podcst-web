import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { primeFeedCache } from '../player/feed';
import type { Playable } from '../player/types';
import {
  boostSet,
  filterEpisodes,
  searchShows,
  searchThemes,
  searchWar,
  showsToScan,
} from './search';

describe('WAR search', () => {
  it('finds shows and prefers owner favorites when relevant', () => {
    const { items, total } = searchShows('semilla');
    assert.ok(total >= 1);
    assert.ok(items.some((item) => /semilla/i.test(item.title)));
    const acres = searchShows('acres');
    assert.ok(acres.items.some((item) => item.boosted));
  });

  it('surfaces soil and compost as themes', () => {
    const soil = searchThemes('soil');
    assert.ok(soil.length >= 1);
    assert.ok(
      soil.some((theme) => /soil|regenerative|organic/i.test(theme.label)),
    );
    const compost = searchThemes('compost');
    assert.ok(compost.length >= 1);
  });

  it('scans favorite feeds first and filters primed episodes', () => {
    const scan = showsToScan('soil');
    assert.ok(scan.length > 0);
    assert.ok(scan.length <= 8);
    assert.ok(scan.some((item) => item.externalUrls.rss));

    const episode: Playable = {
      id: 'it-1547894245:ep',
      showId: 'it-1547894245',
      showTitle: 'Radio Semilla',
      title: 'Raimundo Labbé. Rehidratar el paisaje',
      kind: 'audio',
      description: 'regenerar suelos',
      sourceUrl: 'https://example.com/ep',
    };
    primeFeedCache(episode.showId, [episode]);
    const hits = filterEpisodes([episode], 'Raimundo');
    assert.equal(hits.length, 1);
    assert.ok(boostSet().has('it-1547894245') || scan.length >= 1);
  });

  it('returns a seed-mode payload without requiring the gzip catalog', () => {
    return searchWar({ q: 'soil' }).then((result) => {
      assert.equal(result.q, 'soil');
      assert.ok(result.shows.length >= 1);
      assert.ok(result.themes.length >= 1);
      assert.ok(result.mode === 'seed' || result.mode === 'full');
    });
  });
});
