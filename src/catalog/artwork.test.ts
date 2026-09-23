import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { appleIdFromCatalogId, resolveArtworkUrl } from './artwork';
import { getEntry } from './store';

describe('artwork resolver', () => {
  it('reads Apple ids from it-* catalog ids', () => {
    assert.equal(appleIdFromCatalogId('it-1547894245'), '1547894245');
    assert.equal(appleIdFromCatalogId('it-1747339811'), '1747339811');
    assert.equal(appleIdFromCatalogId('lex-fridman'), null);
    assert.equal(appleIdFromCatalogId('pi-1'), null);
  });

  it('puts publisher artwork on owner hubs in the seed shelf', () => {
    const semilla = getEntry('it-1547894245');
    const acres = getEntry('it-1747339811');
    assert.match(semilla?.coverArt ?? '', /mzstatic\.com/);
    assert.match(acres?.coverArt ?? '', /mzstatic\.com/);
  });

  it('prefers stored publisher artwork over a live iTunes lookup', async () => {
    const acres = getEntry('it-1747339811');
    assert.ok(acres);
    const url = await resolveArtworkUrl(acres);
    assert.equal(url, acres.coverArt);
  });
});
