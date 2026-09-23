import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseFocus, takeFocused } from '../../scripts/lib/diversity';

describe('INGEST_FOCUS sampling', () => {
  it('parses en,es focus list', () => {
    assert.deepEqual(parseFocus('en,es'), ['en', 'es']);
    assert.deepEqual(parseFocus('es-mx,en-US'), ['es', 'en']);
    assert.deepEqual(parseFocus(''), []);
  });

  it('keeps a diversity floor and boosts focus languages', () => {
    const buckets = new Map<
      string,
      {
        id: string;
        originalLanguage: string;
        signals: { popularity: number };
      }[]
    >();
    buckets.set(
      'en',
      Array.from({ length: 80 }, (_, i) => ({
        id: `en-${i}`,
        originalLanguage: 'en',
        signals: { popularity: 80 - i },
      })),
    );
    buckets.set(
      'es',
      Array.from({ length: 50 }, (_, i) => ({
        id: `es-${i}`,
        originalLanguage: 'es',
        signals: { popularity: 50 - i },
      })),
    );
    buckets.set('yo', [
      {
        id: 'yo-1',
        originalLanguage: 'yo',
        signals: { popularity: 10 },
      },
    ]);
    buckets.set('qu', [
      {
        id: 'qu-1',
        originalLanguage: 'qu',
        signals: { popularity: 10 },
      },
    ]);
    const out = takeFocused(buckets, 40, ['en', 'es']);
    const en = out.filter((item) => item.originalLanguage === 'en').length;
    const es = out.filter((item) => item.originalLanguage === 'es').length;
    const other = out.filter(
      (item) =>
        item.originalLanguage !== 'en' && item.originalLanguage !== 'es',
    ).length;
    assert.ok(en > es, `expected more en than es, got ${en} vs ${es}`);
    assert.ok(other >= 1, 'diversity floor should keep other languages');
    assert.ok(out.some((item) => item.id === 'en-0'));
    assert.ok(out.some((item) => item.id === 'es-0'));
  });
});
