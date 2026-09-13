import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { diversityScore, inferRegion, normalizeLanguage } from './taxonomy';

describe('taxonomy', () => {
  it('normalizes language aliases', () => {
    assert.equal(normalizeLanguage('en-US'), 'en');
    assert.equal(normalizeLanguage('Spanish'), 'es');
    assert.equal(normalizeLanguage('pt-br'), 'pt');
    assert.equal(normalizeLanguage('cmn'), 'cmn');
    assert.equal(normalizeLanguage('Latin'), 'la');
    assert.equal(normalizeLanguage('Old English'), 'en');
  });

  it('infers region from country before language', () => {
    assert.equal(inferRegion('en', 'NG'), 'west-africa');
    assert.equal(inferRegion('ha'), 'sahel');
  });

  it('scores English lower than underrepresented languages', () => {
    assert.ok(diversityScore('yo') > diversityScore('en'));
    assert.ok(diversityScore('qu') > diversityScore('fr'));
  });
});
