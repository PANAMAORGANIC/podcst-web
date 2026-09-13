# Ingest receipts

Each pipeline writes a JSON receipt here when you run:

```bash
npm run ingest:podcasts
npm run ingest:audiobooks
npm run ingest:youtube
npm run ingest:favorites
npm run ingest:recommend
```

Receipts (`*.receipt.json`) are local logs — they are gitignored. The live
catalog snapshot is `../catalog.json.gz` (and compact JSON when it fits),
which the app reads on every request.
