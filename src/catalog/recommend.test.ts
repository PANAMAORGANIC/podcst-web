import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { listFavoriteSeedIds } from './likes';
import { recommendFor, scoreRecommendation } from './recommend';
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
  genres: ['society-culture', 'science'],
  region: 'andes',
  country: 'Ecuador',
  countryCode: 'EC',
  signals: { popularity: 40, diversity: 58 },
});

const eco = entry({
  id: 'it-1447211636',
  title: 'EcoJustice Radio',
  tags: ['climate', 'ecojustice', 'pacifica', 'kpfk', 'public-radio'],
  genres: ['news', 'society-culture'],
  signals: { popularity: 50, diversity: 28 },
});

describe('recommend ranking', () => {
  it('keeps Spanish neighbors ahead of popular English when the seed is Spanish', () => {
    const spanishPeer = entry({
      id: 'es-peer',
      title: 'Semillas del pueblo',
      originalLanguage: 'es',
      tags: ['seeds', 'agroecology'],
      genres: ['society-culture'],
      region: 'andes',
      signals: { popularity: 18, diversity: 76 },
    });
    const usChart = entry({
      id: 'en-chart',
      title: 'Huge US Chart Show',
      originalLanguage: 'en',
      tags: ['comedy'],
      genres: ['comedy'],
      signals: { popularity: 99, diversity: 10 },
    });
    const ranked = recommendFor(semilla, [semilla, spanishPeer, usChart], 5, {
      exploreRate: 0,
    });
    assert.equal(ranked[0]?.id, 'es-peer');
    assert.ok(!ranked.some((item) => item.id === 'en-chart'));
  });

  it('boosts Pacifica hub peers next to EcoJustice', () => {
    const kpfk = entry({
      id: 'it-kpfk',
      title: 'KPFK Evening News',
      tags: ['kpfk', 'pacifica', 'public-radio'],
      genres: ['news'],
      signals: { popularity: 30, diversity: 28 },
    });
    const randomNews = entry({
      id: 'it-news',
      title: 'Generic Hourly News',
      tags: ['ingested', 'en'],
      genres: ['news'],
      signals: { popularity: 90, diversity: 20 },
    });
    const ranked = recommendFor(eco, [eco, randomNews, kpfk], 5, {
      exploreRate: 0,
    });
    assert.equal(ranked[0]?.id, 'it-kpfk');
    assert.ok(
      scoreRecommendation(eco, kpfk).score >
        scoreRecommendation(eco, randomNews).score,
    );
  });

  it('excludes the seed itself and a namesake id', () => {
    const peer = entry({
      id: 'peer',
      title: 'Peer',
      tags: ['climate'],
      genres: ['news'],
    });
    const namesake = entry({
      id: 'pi-eco-copy',
      title: 'EcoJustice Radio',
      tags: ['climate', 'ecojustice'],
      genres: ['news'],
    });
    const ranked = recommendFor(eco, [eco, peer, namesake], 8, {
      exploreRate: 0,
    });
    assert.ok(!ranked.some((item) => item.id === eco.id));
    assert.ok(!ranked.some((item) => item.title === eco.title));
  });

  it('prefers a climate-titled neighbor over a popular generic news show', () => {
    const planet = entry({
      id: 'it-1545009586',
      title: 'Planet: Critical',
      tags: ['climate', 'ecology', 'rachel-donald'],
      genres: ['news', 'society-culture'],
      signals: { popularity: 50, diversity: 28 },
    });
    const crisis = entry({
      id: 'climate-crisis',
      title: 'This Is The Climate Crisis',
      tags: ['recommend'],
      genres: ['news'],
      signals: { popularity: 22, diversity: 40 },
    });
    const cable = entry({
      id: 'cable-news',
      title: 'Prime Time Politics',
      tags: ['recommend'],
      genres: ['news'],
      signals: { popularity: 98, diversity: 12 },
    });
    const ranked = recommendFor(planet, [planet, cable, crisis], 5, {
      exploreRate: 0,
    });
    assert.equal(ranked[0]?.id, 'climate-crisis');
  });

  it('explore rate > 0 changes related order but stays in-neighborhood', () => {
    const peers = Array.from({ length: 12 }, (_, index) =>
      entry({
        id: `es-peer-${index}`,
        title: `Semillas ${index}`,
        originalLanguage: 'es',
        tags: ['seeds', 'agroecology'],
        genres: ['society-culture'],
        region: 'andes',
        signals: { popularity: 20 + index, diversity: 50 },
      }),
    );
    const usChart = entry({
      id: 'en-chart',
      title: 'Huge US Chart Show',
      originalLanguage: 'en',
      tags: ['comedy'],
      genres: ['comedy'],
      signals: { popularity: 99, diversity: 10 },
    });
    const catalog = [semilla, usChart, ...peers];
    const orders = new Set<string>();
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
      const ranked = recommendFor(semilla, catalog, 6, {
        exploreRate: 0.8,
        seed,
      });
      assert.ok(!ranked.some((item) => item.id === 'en-chart'));
      orders.add(ranked.map((item) => item.id).join(','));
    }
    assert.ok(orders.size >= 2);
  });

  it('lists the owner favorite ids as recommend seeds', () => {
    const ids = listFavoriteSeedIds();
    for (const id of [
      'it-1547894245',
      'it-1447211636',
      'it-1751170269',
      'it-566908883',
      'it-1545009586',
      'it-1604218333',
      'it-1747339811',
    ]) {
      assert.ok(ids.includes(id), `missing seed ${id}`);
    }
  });
});
