import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { knownYoutubeChannelId } from '@/catalog/youtube-channel-ids';
import {
  isYoutubeChannelId,
  parseYoutubeAtomFeed,
  parseYoutubeChannelPageUploads,
  uploadsPlaylistId,
  youtubeVideosXmlUrl,
} from './youtube-feed';

const ATOM = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/" xmlns="http://www.w3.org/2005/Atom">
 <title>Veritasium</title>
 <entry>
  <id>yt:video:dQw11w9WgXc</id>
  <yt:videoId>dQw11w9WgXc</yt:videoId>
  <title>Soil is not dirt</title>
  <link rel="alternate" href="https://www.youtube.com/watch?v=dQw11w9WgXc"/>
  <published>2026-04-01T12:00:00+00:00</published>
  <media:group>
   <media:thumbnail url="http://i.ytimg.com/vi/dQw11w9WgXc/hqdefault.jpg" width="480" height="360"/>
   <media:description>A film about &lt;b&gt;living soil&lt;/b&gt;.</media:description>
  </media:group>
 </entry>
 <entry>
  <id>no-video</id>
  <title>No video id we can use if yt tag missing and link missing</title>
 </entry>
 <entry>
  <yt:videoId>abcDEF12345</yt:videoId>
  <title>Second upload</title>
  <link rel="alternate" href="https://www.youtube.com/watch?v=abcDEF12345"/>
 </entry>
</feed>`;

describe('YouTube Atom upload feed', () => {
  it('reads watch URLs and thumbnails without fetching media', () => {
    const episodes = parseYoutubeAtomFeed(ATOM, {
      id: 'veritasium',
      title: 'Veritasium',
    });
    assert.equal(episodes.length, 2);
    assert.equal(episodes[0]?.title, 'Soil is not dirt');
    assert.equal(episodes[0]?.kind, 'youtube');
    assert.equal(episodes[0]?.youtubeId, 'dQw11w9WgXc');
    assert.equal(
      episodes[0]?.sourceUrl,
      'https://www.youtube.com/watch?v=dQw11w9WgXc',
    );
    assert.equal(
      episodes[0]?.artwork,
      'https://i.ytimg.com/vi/dQw11w9WgXc/hqdefault.jpg',
    );
    assert.equal(episodes[0]?.description, 'A film about living soil.');
    assert.equal(episodes[0]?.id, 'veritasium:dQw11w9WgXc');
    assert.equal(episodes[1]?.youtubeId, 'abcDEF12345');
    assert.ok(!JSON.stringify(episodes).includes('<b>'));
  });

  it('caps the list', () => {
    const episodes = parseYoutubeAtomFeed(ATOM, { id: 'v', title: 'V' }, 1);
    assert.equal(episodes.length, 1);
  });
});

describe('YouTube channel page uploads', () => {
  it('reads videoRenderer cards from ytInitialData without fetching watch pages', () => {
    const html = `<!doctype html><script>var ytInitialData = {"contents":{"videoRenderer":{"videoId":"dQw11w9WgXc","title":{"runs":[{"text":"Soil is not dirt"}]}}}};</script>`;
    const episodes = parseYoutubeChannelPageUploads(html, {
      id: 'veritasium',
      title: 'Veritasium',
    });
    assert.equal(episodes.length, 1);
    assert.equal(episodes[0]?.youtubeId, 'dQw11w9WgXc');
    assert.equal(episodes[0]?.title, 'Soil is not dirt');
    assert.equal(episodes[0]?.kind, 'youtube');
    assert.equal(
      episodes[0]?.sourceUrl,
      'https://www.youtube.com/watch?v=dQw11w9WgXc',
    );
  });
});

describe('YouTube channel ids', () => {
  it('recognizes UC ids and the official videos.xml URL', () => {
    assert.equal(isYoutubeChannelId('UCHnyfMqiRRG1u-2MsSQLbXA'), true);
    assert.equal(isYoutubeChannelId('@veritasium'), false);
    assert.equal(
      youtubeVideosXmlUrl('UCHnyfMqiRRG1u-2MsSQLbXA'),
      'https://www.youtube.com/feeds/videos.xml?channel_id=UCHnyfMqiRRG1u-2MsSQLbXA',
    );
    assert.equal(
      uploadsPlaylistId('UCHnyfMqiRRG1u-2MsSQLbXA'),
      'UUHnyfMqiRRG1u-2MsSQLbXA',
    );
  });

  it('maps seed show ids and handles to channel ids', () => {
    assert.equal(
      knownYoutubeChannelId('veritasium'),
      'UCHnyfMqiRRG1u-2MsSQLbXA',
    );
    assert.equal(
      knownYoutubeChannelId(undefined, 'DwarkeshPatel'),
      'UCXl4i9dYBrFOabk0xGmbkRA',
    );
    assert.equal(knownYoutubeChannelId('african-facts'), undefined);
  });
});
