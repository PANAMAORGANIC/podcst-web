import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { queryCatalog, relatedEntries } from './query';
import { CATALOG, catalogStats } from './seed';

describe('catalog seed', () => {
  it('covers all three types and many languages', () => {
    const stats = catalogStats();
    assert.ok(stats.titles >= 80, `expected 80+ titles, got ${stats.titles}`);
    assert.ok(
      stats.languages >= 30,
      `expected 30+ languages, got ${stats.languages}`,
    );
    assert.ok(stats.types.podcast > 20);
    assert.ok(stats.types.audiobook > 15);
    assert.ok(stats.types.youtube > 15);
  });

  it('uses unique ids', () => {
    const ids = CATALOG.map((item) => item.id);
    assert.equal(new Set(ids).size, ids.length);
  });
});

describe('queryCatalog', () => {
  it('finds titles, creators, tags, language, and type', () => {
    assert.ok(queryCatalog({ q: 'Radio Ambulante' }).items.length >= 1);
    assert.ok(queryCatalog({ q: 'Amit Varma' }).items.length >= 1);
    assert.ok(queryCatalog({ q: 'librivox' }).items.length >= 3);
    assert.ok(queryCatalog({ q: 'Yoruba' }).items.length >= 1);
    assert.ok(
      queryCatalog({ q: 'audiobook' }).items.every(
        (item) => item.type === 'audiobook',
      ),
    );
  });

  it('filters by type, language, and region', () => {
    const yoruba = queryCatalog({ language: 'yo' });
    assert.ok(yoruba.total >= 1);
    assert.ok(yoruba.items.every((item) => item.originalLanguage === 'yo'));

    const podcasts = queryCatalog({ type: 'podcast' });
    assert.ok(podcasts.items.every((item) => item.type === 'podcast'));

    const andes = queryCatalog({ region: 'andes' });
    assert.ok(andes.items.every((item) => item.region === 'andes'));
  });

  it('sorts diversity ahead of popularity by default', () => {
    const { items } = queryCatalog({ type: 'podcast' });
    assert.ok(items.length > 2);
    assert.ok(items[0].signals.diversity >= items[1].signals.diversity);
  });
});

describe('relatedEntries', () => {
  it('returns neighbours that share language or region', () => {
    const seed = CATALOG.find((item) => item.id === 'radio-ambulante');
    assert.ok(seed);
    const related = relatedEntries(seed, 4);
    assert.ok(related.length > 0);
    assert.ok(
      related.some(
        (item) =>
          item.originalLanguage === seed.originalLanguage ||
          item.region === seed.region,
      ),
    );
  });
});
