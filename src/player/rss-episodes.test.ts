import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  clipDescription,
  episodeId,
  parseDurationSeconds,
  parseRssEpisodes,
  preferHttps,
} from './rss-episodes';

const FEED = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>The Acres U.S.A. Podcast</title>
    <itunes:image href="https://example.com/show.jpg"/>
    <item>
      <title>Soil week</title>
      <guid>acres-soil-1</guid>
      <pubDate>Mon, 01 Sep 2025 10:00:00 GMT</pubDate>
      <itunes:duration>1:02:03</itunes:duration>
      <link>https://example.com/soil-week</link>
      <enclosure url="http://cdn.example.com/soil.mp3" type="audio/mpeg" length="123"/>
      <itunes:summary><![CDATA[<p>Notes from the field about <em>living soil</em>.</p>]]></itunes:summary>
    </item>
    <item>
      <title>No audio</title>
      <description>Skip me</description>
    </item>
    <item>
      <title>Farm walk</title>
      <guid>yt-farm</guid>
      <link>https://www.youtube.com/watch?v=abcdefghijk</link>
    </item>
  </channel>
</rss>`;

describe('RSS episode parser', () => {
  it('reads enclosure URL, duration, and date without fetching media', () => {
    const episodes = parseRssEpisodes(FEED, {
      id: 'it-1747339811',
      title: 'The Acres U.S.A. Podcast',
    });
    assert.equal(episodes.length, 2);
    assert.equal(episodes[0]?.title, 'Soil week');
    assert.equal(episodes[0]?.kind, 'audio');
    assert.equal(episodes[0]?.enclosureUrl, 'https://cdn.example.com/soil.mp3');
    assert.equal(episodes[0]?.durationSeconds, 3723);
    assert.equal(episodes[0]?.sourceUrl, 'https://example.com/soil-week');
    assert.equal(
      episodes[0]?.description,
      'Notes from the field about living soil.',
    );
    assert.ok(!episodes[0]?.description?.includes('<'));
    assert.ok(!JSON.stringify(episodes).includes('never-fetch'));
    assert.equal(episodes[1]?.kind, 'youtube');
    assert.equal(episodes[1]?.youtubeId, 'abcdefghijk');
  });

  it('skips items without a stream or watch URL', () => {
    const episodes = parseRssEpisodes(FEED, {
      id: 'show',
      title: 'Show',
    });
    assert.ok(!episodes.some((item) => item.title === 'No audio'));
  });
});

describe('duration and ids', () => {
  it('parses clock and second durations', () => {
    assert.equal(parseDurationSeconds('12:03'), 723);
    assert.equal(parseDurationSeconds('90'), 90);
    assert.equal(parseDurationSeconds('bad'), undefined);
  });

  it('keeps episode ids stable for the same guid', () => {
    assert.equal(
      episodeId('show', 'acres-soil-1', 'https://x', 'Soil'),
      episodeId('show', 'acres-soil-1', 'https://other', 'Other'),
    );
  });

  it('clips long episode notes for the player sheet', () => {
    assert.equal(clipDescription('  <p>Soil notes</p>  '), 'Soil notes');
    assert.equal(clipDescription('   '), undefined);
    const long = 'x'.repeat(800);
    const clipped = clipDescription(long);
    assert.ok(clipped);
    assert.ok(clipped.endsWith('…'));
    assert.ok(clipped.length <= 700);
  });

  it('upgrades http enclosures to https', () => {
    assert.equal(
      preferHttps('http://cdn.example.com/a.mp3'),
      'https://cdn.example.com/a.mp3',
    );
  });
});
