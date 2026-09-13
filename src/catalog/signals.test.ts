import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import {
  computeLearnedSignals,
  defaultSignals,
  parseYoutubeUrl,
  searchTermsFromWeights,
} from './signals';
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

describe('YouTube URL signals', () => {
  it('parses channel handles, channel ids, and video URLs', () => {
    const handle = parseYoutubeUrl('https://www.youtube.com/@nathagens');
    assert.equal(handle.kind, 'channel');
    assert.equal(handle.channelHandle, 'nathagens');

    const channel = parseYoutubeUrl(
      'https://www.youtube.com/channel/UCXuqSBlHAE6Xw-yeJA0Tunw',
    );
    assert.equal(channel.kind, 'channel');
    assert.equal(channel.channelId, 'UCXuqSBlHAE6Xw-yeJA0Tunw');

    const watch = parseYoutubeUrl(
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    );
    assert.equal(watch.kind, 'video');
    assert.equal(watch.videoId, 'dQw4w9WgXcQ');

    const short = parseYoutubeUrl('https://youtu.be/dQw4w9WgXcQ');
    assert.equal(short.kind, 'video');
    assert.equal(short.videoId, 'dQw4w9WgXcQ');

    assert.equal(parseYoutubeUrl('https://example.com/feed').kind, 'unknown');
  });
});

describe('weight learning', () => {
  it('raises favorite and like tags, then decays unused weights', () => {
    const climate = entry({
      id: 'it-climate',
      title: 'Planet: Critical',
      tags: ['climate', 'ecology', 'favorite', 'rss', 'en'],
      genres: ['news'],
    });
    const seeds = entry({
      id: 'it-seeds',
      title: 'Radio Semilla',
      type: 'podcast',
      originalLanguage: 'es',
      tags: ['seeds', 'agroecology'],
      genres: ['society-culture'],
    });
    const first = computeLearnedSignals({
      previous: defaultSignals(),
      catalog: [climate, seeds],
      favoriteIds: [climate.id],
      likedIds: [seeds.id],
      decay: true,
    });
    assert.ok((first.weights.climate ?? 0) > 2);
    assert.ok((first.weights.seeds ?? 0) > 2);
    assert.equal(first.weights.favorite, undefined);
    assert.equal(first.weights.rss, undefined);
    assert.equal(first.weights.en, undefined);
    assert.ok(first.sources.includes('favorites'));
    assert.ok(first.sources.includes('likes'));
    assert.ok(first.learnedAt);

    const second = computeLearnedSignals({
      previous: first,
      catalog: [climate, seeds],
      favoriteIds: [],
      likedIds: [],
      decay: true,
    });
    assert.ok(second.weights.climate < first.weights.climate);
    assert.ok((second.weights.climate ?? 0) > 0);
  });

  it('turns top weights into search terms and skips language codes', () => {
    const signals = defaultSignals();
    signals.weights = { climate: 4, en: 3, ecology: 2.2, es: 1 };
    assert.deepEqual(searchTermsFromWeights(signals, 3), [
      'climate',
      'ecology',
    ]);
  });
});

describe('YouTube catalog pack', () => {
  it('ships at least 300 unique curated channels', () => {
    const sources = JSON.parse(
      readFileSync('data/sources/youtube-channels.json', 'utf8'),
    ) as { id: string }[];
    const ids = new Set(sources.map((row) => row.id));
    assert.ok(sources.length >= 300, `only ${sources.length} channels`);
    assert.equal(ids.size, sources.length);
  });
});
