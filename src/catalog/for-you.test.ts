import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { rankForYouFrom, scoreForYouTitle } from './for-you';
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

describe('For You mix', () => {
  it('includes matching podcasts and YouTube, and skips audiobooks', () => {
    const signals = defaultSignals();
    signals.weights = { climate: 5, lecture: 3, ecology: 4 };
    const podcast = entry({
      id: 'pod-climate',
      title: 'Climate Hour',
      tags: ['climate', 'ecology'],
      genres: ['news'],
    });
    const youtube = entry({
      id: 'yt-lecture',
      title: 'Earth Systems lecture',
      type: 'youtube',
      tags: ['climate', 'lecture'],
      genres: ['science'],
      externalUrls: { youtube: 'https://www.youtube.com/@earth' },
    });
    const book = entry({
      id: 'lv-book',
      title: 'A climate novel',
      type: 'audiobook',
      tags: ['climate'],
      genres: ['fiction'],
    });
    const comedy = entry({
      id: 'pod-jokes',
      title: 'Standup Dump',
      tags: ['comedy'],
      genres: ['comedy'],
      originalLanguage: 'de',
      signals: { popularity: 99, diversity: 10 },
    });

    assert.ok(scoreForYouTitle(book, signals, new Set()) < 0);
    const ranked = rankForYouFrom(
      [podcast, youtube, book, comedy],
      signals,
      [],
      8,
      new Date('2026-09-13T12:00:00Z'),
    );
    const ids = ranked.map((item) => item.id);
    assert.ok(ids.includes('pod-climate'));
    assert.ok(ids.includes('yt-lecture'));
    assert.ok(!ids.includes('lv-book'));
    assert.ok(ids.indexOf('pod-climate') < ids.indexOf('pod-jokes'));
  });
});
