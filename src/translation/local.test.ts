import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getEntry } from '../catalog/seed';
import { LocalCatalogTranslator } from './local';

describe('LocalCatalogTranslator', () => {
  it('returns curated English for a known Spanish title', async () => {
    const entry = getEntry('radio-ambulante');
    assert.ok(entry);
    const translator = new LocalCatalogTranslator();
    const result = await translator.translate({
      text: entry.title,
      source: 'es',
      target: 'en',
    });
    assert.equal(result.text, entry.translations?.en?.title);
    assert.equal(result.provider, 'local-catalog');
  });

  it('passes English through', async () => {
    const translator = new LocalCatalogTranslator();
    const result = await translator.translate({
      text: 'This American Life',
      source: 'en',
      target: 'en',
    });
    assert.equal(result.text, 'This American Life');
  });
});
