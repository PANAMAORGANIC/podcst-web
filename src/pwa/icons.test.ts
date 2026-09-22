import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
const ICONS = ['icon-192.png', 'icon-512.png', 'apple-touch-icon.png'] as const;

describe('PWA icons', () => {
  it('ships PNG icons for Add to Home Screen', () => {
    for (const name of ICONS) {
      const buf = readFileSync(
        path.join(process.cwd(), 'public', 'icons', name),
      );
      assert.ok(buf.subarray(0, 4).equals(PNG), name);
      assert.ok(buf.length > 200, name);
    }
  });
});
