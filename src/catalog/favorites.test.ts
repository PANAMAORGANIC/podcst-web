import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  collectPins,
  favoriteId,
  foldTitle,
  loadFavoritesFile,
  parsePinnedTitles,
  pickItunesHit,
  scoreItunesTitle,
} from '../../scripts/lib/favorites';
import { parseRssChannel } from '../../scripts/lib/rss';
import { queryCatalog } from './query';
import { getCatalog } from './store';

const OWNER_FAVORITES = [
  'Radio Semilla',
  'EcoJustice Radio',
  '632nm',
  'Tangentially Speaking with Christopher Ryan',
  'Planet: Critical',
  'The Great Simplification with Nate Hagens',
  'The Acres U.S.A. Podcast',
];

const OWNER_IDS: Record<string, string> = {
  'Radio Semilla': 'it-1547894245',
  'EcoJustice Radio': 'it-1447211636',
  '632nm': 'it-1751170269',
  'Tangentially Speaking with Christopher Ryan': 'it-566908883',
  'Planet: Critical': 'it-1545009586',
  'The Great Simplification with Nate Hagens': 'it-1604218333',
  'The Acres U.S.A. Podcast': 'it-1747339811',
};

describe('favorites source file', () => {
  it('lists the owner RSS hubs with Apple ids', () => {
    const file = loadFavoritesFile();
    const titles = file.shows.map((show) => show.title);
    for (const title of OWNER_FAVORITES) {
      assert.ok(titles.includes(title), `missing ${title}`);
    }
    const hubs = Object.fromEntries(
      file.shows.map((show) => [show.title, show.hub]),
    );
    assert.equal(hubs['Radio Semilla'], 'anchor');
    assert.equal(hubs['EcoJustice Radio'], 'soundcloud');
    assert.equal(hubs['632nm'], 'transistor');
    assert.equal(
      hubs['Tangentially Speaking with Christopher Ryan'],
      'substack',
    );
    assert.equal(hubs['Planet: Critical'], 'podbean');
    assert.equal(hubs['The Great Simplification with Nate Hagens'], 'libsyn');
    assert.equal(hubs['The Acres U.S.A. Podcast'], 'anchor');
    const byTitle = new Map(file.shows.map((show) => [show.title, show]));
    for (const [title, id] of Object.entries(OWNER_IDS)) {
      assert.equal(favoriteId(byTitle.get(title) ?? { feedUrl: '' }), id);
    }
    assert.ok((file.hubs?.pacifica?.itunesQueries?.length ?? 0) >= 6);
  });
});

describe('RSS channel parser', () => {
  it('reads title, language, artwork, and item count without enclosures', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>Radio Semilla</title>
    <link>https://redsemillas.org/</link>
    <language>es-ec</language>
    <itunes:author>Red de Guardianes de Semillas</itunes:author>
    <itunes:image href="https://example.com/cover.jpg"/>
    <description><![CDATA[Semillas criollas y agroecología.]]></description>
    <item>
      <title>Episodio 1</title>
      <enclosure url="https://example.com/never-fetch.mp3" type="audio/mpeg"/>
    </item>
    <item><title>Episodio 2</title></item>
  </channel>
</rss>`;
    const channel = parseRssChannel(xml);
    assert.equal(channel.title, 'Radio Semilla');
    assert.equal(channel.language, 'es-ec');
    assert.equal(channel.author, 'Red de Guardianes de Semillas');
    assert.equal(channel.image, 'https://example.com/cover.jpg');
    assert.equal(channel.description, 'Semillas criollas y agroecología.');
    assert.equal(channel.itemCount, 2);
    assert.ok(!JSON.stringify(channel).includes('never-fetch'));
  });
});

describe('search-and-pin matching', () => {
  it('prefers the Christopher Ryan Apple hit over a namesake', () => {
    const hit = pickItunesHit('Tangentially Speaking with Christopher Ryan', [
      { collectionName: 'Tangentially Speaking' },
      { collectionName: 'Tangentially Speaking with Christopher Ryan' },
      { collectionName: 'Speaking in Tongues' },
    ]);
    assert.equal(
      hit?.collectionName,
      'Tangentially Speaking with Christopher Ryan',
    );
    assert.ok(
      scoreItunesTitle(
        'Tangentially Speaking with Christopher Ryan',
        'Tangentially Speaking',
      ) < 100,
    );
    assert.equal(foldTitle('EcoJustice Radio'), 'ecojustice radio');
  });

  it('reads pins from env, argv, and the favorites file', () => {
    const pins = parsePinnedTitles('Show A|Show B', [
      'node',
      'script',
      '--pin',
      'Show C',
    ]);
    assert.deepEqual(
      pins.map((pin) => pin.title),
      ['Show A', 'Show B', 'Show C'],
    );
    const collected = collectPins(
      { shows: [], pins: ['Show A'] },
      process.cwd(),
      '',
      ['node', 'script'],
    );
    assert.ok(collected.some((pin) => pin.title === 'Show A'));
  });
});

describe('live catalog favorites', () => {
  it('finds all owner titles after RSS ingest', () => {
    const catalog = getCatalog();
    for (const title of OWNER_FAVORITES) {
      const hit = catalog.find((item) => item.title === title);
      assert.ok(hit, `catalog missing ${title}`);
      assert.ok(hit.externalUrls.rss, `${title} needs an RSS link`);
      assert.equal(hit.id, OWNER_IDS[title]);
    }
    assert.equal(
      catalog.find((item) => item.id === 'it-566908883')?.title,
      'Tangentially Speaking with Christopher Ryan',
    );
    for (const title of [
      'Radio Semilla',
      '632nm',
      'Planet: Critical',
      'The Great Simplification with Nate Hagens',
      'The Acres U.S.A. Podcast',
    ]) {
      assert.ok(
        queryCatalog({ q: title }).items.some((item) => item.title === title),
        `search missed ${title}`,
      );
    }
  });
});
