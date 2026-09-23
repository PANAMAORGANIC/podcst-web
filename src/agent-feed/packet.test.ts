import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getEntry } from '../catalog/store';
import type { Playable } from '../player/types';
import { buildAgentFeed, buildAskWarFeed, grokBotSidebarUrl } from './packet';
import { WAR_GROK_AGENT_ID } from './types';

describe('buildAgentFeed', () => {
  it('builds a stable packet from a title', () => {
    const entry = getEntry('radio-ambulante');
    assert.ok(entry);
    const { packet, markdown } = buildAgentFeed(entry, {
      includeTitle: true,
      intent: 'distill',
      userNote: 'Use for LatAm narrative brief',
      quote: 'Un mapa sonoro de las Américas.',
      capturedAt: '2026-09-13T15:00:00.000Z',
      url: 'https://example.test/title/radio-ambulante',
    });

    assert.equal(packet.source, 'world-audio-repository');
    assert.equal(packet.version, 1);
    assert.equal(packet.type, 'podcast');
    assert.equal(packet.title, 'Radio Ambulante');
    assert.ok(packet.creators.length > 0);
    assert.equal(packet.language, 'es');
    assert.equal(packet.region, 'latin-america');
    assert.ok(packet.tags.includes('journalism'));
    assert.equal(packet.intent, 'distill');
    assert.equal(packet.selectedText, entry.description);
    assert.equal(packet.quote, 'Un mapa sonoro de las Américas.');
    assert.equal(packet.userNote, 'Use for LatAm narrative brief');
    assert.equal(packet.links.rss, entry.externalUrls.rss);
    assert.match(markdown, /Distill a source/);
    assert.match(markdown, /Use for LatAm narrative brief/);
    assert.match(markdown, /Un mapa sonoro/);
    assert.match(markdown, /copyrighted audio/);
  });

  it('omits unused optional fields', () => {
    const entry = getEntry('this-american-life');
    assert.ok(entry);
    const { packet } = buildAgentFeed(entry, {
      includeTitle: false,
      excerpt: '  long-form documentary  ',
    });
    assert.equal(packet.selectedText, 'long-form documentary');
    assert.equal(packet.quote, undefined);
    assert.equal(packet.userNote, undefined);
    assert.equal(packet.timestamp, undefined);
    assert.equal(packet.intent, 'distill');
  });

  it('builds an Ask WAR packet for agent 5140399 only', () => {
    const entry = getEntry('it-1547894245') ?? getEntry('radio-ambulante');
    assert.ok(entry);
    const episode: Playable = {
      id: `${entry.id}:ep-1`,
      showId: entry.id,
      showTitle: entry.title,
      title: 'Soil week',
      kind: 'audio',
      sourceUrl: 'https://example.com/soil-week',
      description: 'Notes from the field.',
      durationSeconds: 3600,
    };
    const { packet, markdown } = buildAskWarFeed(entry, episode, {
      question: 'Who is Primavesi in this episode?',
      timestamp: '12:04',
      capturedAt: '2026-09-23T02:00:00.000Z',
      url: 'https://example.test/title/show',
    });
    assert.equal(packet.agent?.id, WAR_GROK_AGENT_ID);
    assert.equal(packet.agent?.name, 'WAR');
    assert.equal(packet.intent, 'research');
    assert.equal(packet.episode?.title, 'Soil week');
    assert.equal(packet.episode?.sourceUrl, 'https://example.com/soil-week');
    assert.equal(
      packet.userNote,
      "RED's question: Who is Primavesi in this episode?",
    );
    assert.ok(!JSON.stringify(packet).includes('enclosure'));
    assert.match(markdown, /Ask WAR/);
    assert.match(markdown, /5140399/);
    assert.match(markdown, /RED's question/);
    assert.equal(grokBotSidebarUrl(), 'grokbot://app/v1/sidebar?agent=5140399');
  });
});
