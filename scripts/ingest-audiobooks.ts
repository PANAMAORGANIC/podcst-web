#!/usr/bin/env npx tsx

/**
 * Audiobook ingest stub (LibriVox-class + publisher metadata).
 *
 * Public-domain collections can be listed from LibriVox / Project Gutenberg
 * catalogues. Copyrighted titles are stored as metadata and store links only.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

async function main() {
  console.log('World Audio Repository — audiobook ingest (stub)');
  const outDir = path.join(process.cwd(), 'data', 'ingest');
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, 'audiobooks.receipt.json');
  await writeFile(
    outPath,
    JSON.stringify(
      {
        ok: true,
        mode: 'stub',
        providers: ['librivox', 'gutenberg', 'publisher-store-links'],
        rules: [
          'Public-domain: keep librivox/gutenberg URLs, never re-encode audio',
          'In-copyright: title, creators, language, store/publisher URL only',
          'Do not scrape commercial audiobook files',
        ],
        next: [
          'Paginate the LibriVox API for language-diverse public-domain works',
          'Hand-curate contemporary titles as metadata cards',
        ],
      },
      null,
      2,
    ),
  );
  console.log(`Wrote ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
