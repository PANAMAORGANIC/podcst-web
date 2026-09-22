import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  EDITORIAL_RECIPES,
  editorialRailsFrom,
  recipeIsActive,
} from './editorial';
import { defaultSignals } from './signals';
import type { CatalogEntry } from './types';

function entry(
  partial: Partial<CatalogEntry> & Pick<CatalogEntry, 'id' | 'title'>,
): CatalogEntry {
  return {
    type: 'podcast',
    originalLanguage: 'en',
    creators: ['Host'],
    description: partial.title,
    tags: [],
    genres: [],
    region: 'north-america',
    country: 'United States',
    countryCode: 'US',
    externalUrls: { rss: `https://example.com/${partial.id}` },
    signals: { popularity: 20, diversity: 28 },
    ...partial,
  };
}

const semilla = entry({
  id: 'it-1547894245',
  title: 'Radio Semilla',
  originalLanguage: 'es',
  tags: ['seeds', 'agroecology', 'andes'],
  genres: ['society-culture'],
  region: 'andes',
});

describe('editorial rails from consumption signals', () => {
  it('activates climate/energy when those weights exist', () => {
    const climate = EDITORIAL_RECIPES.find(
      (row) => row.id === 'climate-energy',
    );
    assert.ok(climate);
    const signals = defaultSignals();
    signals.weights = { climate: 4, energy: 3 };
    assert.equal(recipeIsActive(climate, signals, []), true);
    assert.equal(recipeIsActive(climate, defaultSignals(), []), false);
  });

  it('labels rails Learned: … and keeps them in-neighborhood', () => {
    const signals = defaultSignals();
    signals.weights = { climate: 5, energy: 4, agroecology: 4, seeds: 3 };
    const catalog = [
      entry({
        id: 'yt-climate',
        title: 'Climate Hour',
        type: 'youtube',
        tags: ['climate', 'energy'],
        genres: ['news'],
      }),
      entry({
        id: 'pod-energy',
        title: 'Energy Desk',
        tags: ['energy', 'interviews'],
        genres: ['science'],
      }),
      entry({
        id: 'pod-soil',
        title: 'Soil Week',
        tags: ['agroecology', 'seeds'],
        genres: ['society-culture'],
      }),
      entry({
        id: 'es-semillas',
        title: 'Semillas del sur',
        originalLanguage: 'es',
        tags: ['seeds', 'agroecology'],
        genres: ['society-culture'],
        region: 'andes',
      }),
      entry({
        id: 'en-regen',
        title: 'Regeneration Now',
        tags: ['regeneration', 'seeds'],
        genres: ['science'],
      }),
      entry({
        id: 'comedy',
        title: 'Standup Dump',
        tags: ['comedy'],
        genres: ['comedy'],
      }),
      ...Array.from({ length: 4 }, (_, index) =>
        entry({
          id: `climate-extra-${index}`,
          title: `Climate extra ${index}`,
          tags: ['climate'],
          genres: ['news'],
        }),
      ),
    ];
    const rails = editorialRailsFrom({
      catalog,
      signals,
      favorites: [semilla],
      maxRails: 4,
      limit: 4,
      explore: { exploreRate: 0, seed: 'fixed' },
    });
    assert.ok(rails.length >= 1);
    for (const rail of rails) {
      assert.ok(
        rail.title.startsWith('Learned:'),
        `expected Learned title, got ${rail.title}`,
      );
      assert.ok(
        rail.id.startsWith('editorial-') || rail.id.startsWith('learned-'),
      );
      assert.ok(!rail.items.some((item) => item.id === 'comedy'));
    }
    const soil = rails.find(
      (rail) => rail.id === 'editorial-soil-regenerative',
    );
    assert.ok(soil);
    assert.match(soil.lede, /Radio Semilla/);
  });

  it('explore rate > 0 changes editorial order across seeds', () => {
    const signals = defaultSignals();
    signals.weights = { climate: 5 };
    const catalog = Array.from({ length: 16 }, (_, index) =>
      entry({
        id: `c-${index}`,
        title: `Climate ${index}`,
        tags: ['climate', 'energy'],
        genres: ['news'],
        signals: { popularity: 10 + index, diversity: 30 },
      }),
    );
    const orders = new Set<string>();
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
      const rails = editorialRailsFrom({
        catalog,
        signals,
        favorites: [],
        maxRails: 1,
        limit: 6,
        explore: { exploreRate: 0.85, seed },
      });
      orders.add(rails[0]?.items.map((item) => item.id).join(',') ?? '');
    }
    assert.ok(orders.size >= 2);
  });
});
