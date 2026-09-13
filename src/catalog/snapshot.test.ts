import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { loadSnapshot } from './snapshot';

describe('catalog snapshot', () => {
  it('loads the checked-in gzip or json snapshot', () => {
    const items = loadSnapshot();
    assert.ok(items.length >= 200);
    assert.ok(items.some((item) => item.id.startsWith('pi-')));
  });
});
