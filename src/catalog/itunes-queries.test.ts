import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  expandItunesQueries,
  itunesStorefronts,
  loadItunesQueries,
} from '../../scripts/lib/itunes-queries';

describe('itunes storefront harvest', () => {
  it('expands language-first queries with storefront × genre packs', () => {
    const queries = expandItunesQueries(
      [
        {
          country: 'ng',
          term: 'hausa',
          language: 'ha',
          region: 'sahel',
        },
      ],
      {
        defaultGenreIds: [1311],
        storefronts: [
          {
            country: 'mx',
            language: 'es',
            region: 'latin-america',
            terms: ['crónica'],
          },
        ],
      },
    );
    assert.ok(queries.some((query) => query.country === 'ng'));
    assert.ok(
      queries.some(
        (query) => query.country === 'mx' && query.term === 'crónica',
      ),
    );
    assert.ok(
      queries.some((query) => query.country === 'mx' && query.genreId === 1311),
    );
  });

  it('covers the required Apple storefronts in source data', () => {
    const queries = loadItunesQueries();
    const countries = new Set(itunesStorefronts(queries));
    for (const code of [
      'us',
      'mx',
      'br',
      'ng',
      'in',
      'jp',
      'de',
      'fr',
      'es',
      'ar',
      'eg',
      'za',
      'kr',
      'cn',
      'pl',
      'tr',
      'id',
      'ph',
    ]) {
      assert.ok(countries.has(code), `missing storefront ${code}`);
    }
    assert.ok(
      queries.length >= 120,
      `expected 120+ queries, got ${queries.length}`,
    );
    assert.ok(queries.some((query) => query.genreId));
  });
});
