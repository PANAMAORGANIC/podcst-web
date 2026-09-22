import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  FULL_CATALOG_MIN_BYTES,
  HOSTED_TRIAL_BYTES,
  hostedTrialFallbackBytes,
  shouldLoadFullSnapshot,
} from './memory';
import { snapshotFileStats } from './snapshot';
import { catalogRuntime } from './store';

describe('catalog memory gate', () => {
  it('skips the gzip snapshot on trial-sized RAM unless forced', () => {
    const trial = 512 * 1024 * 1024;
    assert.equal(shouldLoadFullSnapshot({}, trial), false);
    assert.equal(shouldLoadFullSnapshot({ CATALOG_FULL: '1' }, trial), true);
    assert.equal(
      shouldLoadFullSnapshot({ CATALOG_FULL: '0' }, 2 * FULL_CATALOG_MIN_BYTES),
      false,
    );
    assert.equal(shouldLoadFullSnapshot({}, 2 * FULL_CATALOG_MIN_BYTES), true);
  });

  it('treats Railway as trial RAM when CATALOG_FULL is unset', () => {
    assert.equal(
      hostedTrialFallbackBytes({ RAILWAY_ENVIRONMENT: 'production' }),
      HOSTED_TRIAL_BYTES,
    );
    assert.equal(hostedTrialFallbackBytes({}), null);
    assert.equal(
      shouldLoadFullSnapshot(
        { RAILWAY_ENVIRONMENT: 'production' },
        HOSTED_TRIAL_BYTES,
      ),
      false,
    );
    assert.equal(
      shouldLoadFullSnapshot(
        { RAILWAY_ENVIRONMENT: 'production', CATALOG_FULL: '1' },
        HOSTED_TRIAL_BYTES,
      ),
      true,
    );
  });
});

describe('catalog runtime stats', () => {
  it('reports gzip size without requiring a loaded catalogue', () => {
    const files = snapshotFileStats();
    assert.ok(files.gz);
    assert.ok(files.gzBytes > 1_000_000);
    const runtime = catalogRuntime();
    assert.equal(runtime.gzBytes, files.gzBytes);
    assert.ok(runtime.intended === 'full' || runtime.intended === 'seed');
    assert.ok(
      runtime.mode === 'pending' ||
        runtime.mode === 'full' ||
        runtime.mode === 'seed',
    );
  });
});
