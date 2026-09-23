import assert from 'node:assert/strict';
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { readLikedFile, writeLikedFile } from './likes';

describe('liked.json persist', () => {
  it('writes and reads ids when the disk is writable', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'war-likes-'));
    try {
      assert.equal(
        writeLikedFile(['it-1747339811', 'it-1547894245'], root),
        true,
      );
      assert.deepEqual(readLikedFile(root), ['it-1747339811', 'it-1547894245']);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('returns false when liked.json cannot be written', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'war-likes-ro-'));
    const sources = path.join(root, 'data', 'sources');
    mkdirSync(sources, { recursive: true });
    const blocker = path.join(sources, 'liked.json');
    writeFileSync(blocker, 'locked');
    chmodSync(blocker, 0o444);
    chmodSync(sources, 0o555);
    try {
      assert.equal(writeLikedFile(['it-1747339811'], root), false);
      assert.deepEqual(readLikedFile(root), []);
    } finally {
      chmodSync(sources, 0o755);
      chmodSync(blocker, 0o644);
      rmSync(root, { recursive: true, force: true });
    }
  });
});
