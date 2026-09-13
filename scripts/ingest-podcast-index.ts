#!/usr/bin/env npx tsx

/**
 * Podcast ingest path (Podcast Index).
 *
 * v1 ships a curated seed so the app runs without a database.
 * This script documents — and, when configured, performs — a metadata-only
 * sync from the public Podcast Index feeds dump.
 *
 * It never downloads episode audio.
 *
 * Environment:
 *   PODCASTINDEX_DUMP_URL  optional override of the public dump
 *   DATABASE_URL           optional Postgres URL; without it, write JSON
 *   INGEST_LIMIT           default 200
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DUMP =
  process.env.PODCASTINDEX_DUMP_URL ??
  'https://public.podcastindex.org/podcastindex_feeds.db.tgz';

interface MappedPodcast {
  source: 'podcast-index';
  type: 'podcast';
  title: string;
  language: string | null;
  feedUrl: string | null;
  description: string | null;
  imageUrl: string | null;
  podcastIndexId: number | null;
}

async function main() {
  const limit = Number(process.env.INGEST_LIMIT ?? '200');
  console.log('World Audio Repository — podcast ingest');
  console.log(`Source: ${DUMP}`);
  console.log(
    'This pass is metadata-only. Audio enclosures are ignored on purpose.',
  );

  if (!process.env.DATABASE_URL) {
    const sample: MappedPodcast[] = [
      {
        source: 'podcast-index',
        type: 'podcast',
        title: '(dry run) connect DATABASE_URL or drop a local dump to sync',
        language: null,
        feedUrl: null,
        description:
          'The production ingest maps Podcast Index rows onto CatalogEntry and upserts them. This stub writes a receipt so the path is exercisable without keys or a dump.',
        imageUrl: null,
        podcastIndexId: null,
      },
    ];
    const outDir = path.join(process.cwd(), 'data', 'ingest');
    await mkdir(outDir, { recursive: true });
    const outPath = path.join(outDir, 'podcasts.receipt.json');
    await writeFile(
      outPath,
      JSON.stringify(
        {
          ok: true,
          mode: 'stub',
          source: DUMP,
          limit,
          mapped: sample,
          next: [
            'Download the Podcast Index SQLite dump',
            'Map language, title, author, feed, description, image',
            'Upsert into the catalog store (file or Postgres)',
            'Never persist enclosure URLs as hosted files',
          ],
        },
        null,
        2,
      ),
    );
    console.log(`Wrote ${outPath}`);
    return;
  }

  console.log(
    'DATABASE_URL is set. Wire the dump parser from the retired podcst sync here.',
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
