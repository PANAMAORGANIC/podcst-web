import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  clampCatalogLimit,
  fromPublicCatalogItem,
  toPublicCatalogItem,
} from './public';
import { queryCatalog } from './query';
import type { CatalogEntry } from './types';

function entry(): CatalogEntry {
  return {
    id: 'it-1545009586',
    type: 'podcast',
    title: 'Planet: Critical',
    originalLanguage: 'en',
    creators: ['Rachel Donald'],
    description: 'Climate interviews',
    tags: ['climate', 'ecology'],
    genres: ['news'],
    region: 'europe',
    country: 'United Kingdom',
    countryCode: 'GB',
    externalUrls: {
      rss: 'https://example.com/pc',
      store: 'https://podcasts.apple.com/podcast/id1545009586',
    },
    coverArt: 'https://example.com/cover.jpg',
    signals: { popularity: 50, diversity: 28 },
  };
}

describe('public catalog record', () => {
  it('exposes the documented catalogue fields', () => {
    const item = toPublicCatalogItem(entry());
    assert.equal(item.id, 'it-1545009586');
    assert.equal(item.type, 'podcast');
    assert.equal(item.title, 'Planet: Critical');
    assert.equal(item.language, 'en');
    assert.deepEqual(item.creators, ['Rachel Donald']);
    assert.equal(item.description, 'Climate interviews');
    assert.deepEqual(item.tags, ['climate', 'ecology']);
    assert.equal(item.region, 'europe');
    assert.equal(item.cover, 'https://example.com/cover.jpg');
    assert.equal(item.urls.rss, 'https://example.com/pc');
    assert.equal(item.signals.popularity, 50);
    assert.equal('originalLanguage' in item, false);
    assert.equal(fromPublicCatalogItem(item).originalLanguage, 'en');
    assert.equal(fromPublicCatalogItem(item).id, item.id);
  });

  it('clamps list limits', () => {
    assert.equal(clampCatalogLimit(undefined), 24);
    assert.equal(clampCatalogLimit(0), 24);
    assert.equal(clampCatalogLimit(500), 100);
    assert.equal(clampCatalogLimit(12), 12);
  });
});

describe('catalog pagination', () => {
  it('pages with offset without changing total', () => {
    const first = queryCatalog({ type: 'podcast', sort: 'title', limit: 5 });
    const second = queryCatalog({
      type: 'podcast',
      sort: 'title',
      limit: 5,
      offset: 5,
    });
    assert.ok(first.total >= 10);
    assert.equal(first.total, second.total);
    assert.equal(first.items.length, 5);
    assert.equal(second.items.length, 5);
    assert.notEqual(first.items[0]?.id, second.items[0]?.id);
  });
});
