import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseSubscriptionIds } from './subscriptions';

describe('subscription ids', () => {
  it('reads a device library list', () => {
    assert.deepEqual(parseSubscriptionIds(null), []);
    assert.deepEqual(
      parseSubscriptionIds('["it-1747339811","it-1547894245"]'),
      ['it-1747339811', 'it-1547894245'],
    );
    assert.deepEqual(parseSubscriptionIds('{"ids":[]}'), []);
  });
});
