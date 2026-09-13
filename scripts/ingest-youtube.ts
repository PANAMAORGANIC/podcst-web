#!/usr/bin/env npx tsx

/**
 * YouTube metadata ingest stub.
 *
 * A later pass can use the YouTube Data API to pull channel and playlist
 * metadata (title, description, language, country). This never downloads
 * video or audio.
 *
 * Environment (documented, not required for the demo):
 *   YOUTUBE_API_KEY
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

async function main() {
  console.log('World Audio Repository — YouTube ingest (stub)');
  if (!process.env.YOUTUBE_API_KEY) {
    console.log('No YOUTUBE_API_KEY set; writing a dry-run receipt.');
  }
  const outDir = path.join(process.cwd(), 'data', 'ingest');
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, 'youtube.receipt.json');
  await writeFile(
    outPath,
    JSON.stringify(
      {
        ok: true,
        mode: process.env.YOUTUBE_API_KEY ? 'ready' : 'stub',
        rules: [
          'Store channel/playlist metadata and canonical URLs only',
          'Do not download media',
          'Prefer editorially chosen long-form channels over trending shorts',
        ],
        next: [
          'channels.list + playlists.list for curated channel IDs',
          'Map defaultAudioLanguage / country onto CatalogEntry',
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
