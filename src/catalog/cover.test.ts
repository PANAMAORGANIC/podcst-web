import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { coverUrl, generatedCoverPath, isRemoteArtworkUrl } from './cover';
import type { CatalogEntry } from './types';

function entry(coverArt?: string): CatalogEntry {
  return {
    id: 'it-1545009586',
    type: 'podcast',
    title: 'Planet: Critical',
    originalLanguage: 'en',
    creators: ['Rachel Donald'],
    description: 'Climate',
    tags: ['climate'],
    genres: ['news'],
    region: 'europe',
    country: 'United Kingdom',
    countryCode: 'GB',
    externalUrls: { rss: 'https://example.com/pc' },
    coverArt,
    signals: { popularity: 50, diversity: 28 },
  };
}

describe('cover art', () => {
  it('uses a clear remote http(s) artwork URL', () => {
    const url = 'https://is1-ssl.mzstatic.com/image/thumb/cover.jpg';
    assert.equal(isRemoteArtworkUrl(url), true);
    assert.equal(coverUrl(entry(url)), url);
  });

  it('falls back to the generated mark when artwork is missing or unsafe', () => {
    assert.equal(isRemoteArtworkUrl(undefined), false);
    assert.equal(isRemoteArtworkUrl('javascript:alert(1)'), false);
    assert.equal(isRemoteArtworkUrl('/local/cover.png'), false);
    const generated = generatedCoverPath('it-1545009586');
    assert.equal(coverUrl(entry()), generated);
    assert.equal(coverUrl(entry('not-a-url')), generated);
    assert.equal(generated, '/api/cover/it-1545009586');
  });
});
