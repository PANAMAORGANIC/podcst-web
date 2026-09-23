# YouTube signals (API, not homepage scrape)

World Audio Repository learns For You from **WAR likes**, **pinned
favorites**, and **optional YouTube Data API** signals. It does **not**
scrape `youtube.com` homepage or recommendation HTML. That feed has no
supported public API, and scraping it is out of scope.

## What the API can do

| Need | Credential | Endpoint |
| --- | --- | --- |
| Enrich curated channel cards | API key | `channels.list` (`snippet`, `topicDetails`) |
| Expand by learned topics | API key | `search.list` (`type=channel`) |
| The user’s subscriptions | OAuth | `subscriptions.list` (`mine=true`) |
| The user’s liked videos | OAuth | `videos.list` (`myRating=like`) |

An API key **cannot** read private `mine=true` lists. Those need an OAuth
refresh token with YouTube readonly scope. Until that token exists,
`ingest:for-you` still re-reads likes/favorites and searches public
catalogues (curated YouTube JSON + Apple Search; YouTube search when a
key is present).

## Google Cloud — API key

1. Open [Google Cloud Console](https://console.cloud.google.com/) and
   create or select a project.
2. Enable **YouTube Data API v3** (APIs & Services → Library).
3. APIs & Services → Credentials → **Create credentials → API key**.
4. Restrict the key to YouTube Data API v3 (and, if you want, to your
   server IPs).
5. Copy `.env.example` to `.env.local` and set `YOUTUBE_API_KEY` to that
   value. Do not commit the key.

```bash
npm run ingest:youtube    # enrich curated channels when the key is set
npm run ingest:for-you    # public topic search + learned snapshot
```

## Google Cloud — OAuth (later, for subscriptions / likes)

Leave these empty until you are ready. The app will not invent secrets.

1. APIs & Services → OAuth consent screen (External or Internal).
2. Add scope `https://www.googleapis.com/auth/youtube.readonly`.
3. Credentials → **Create credentials → OAuth client ID** (Desktop app
   or Web application).
4. Complete the installed-app or web consent flow once as the catalogue
   owner. Save the **refresh token** — Google shows it only after the
   first grant.
5. Put the client id, client secret, and refresh token in `.env.local`:

```bash
YOUTUBE_OAUTH_CLIENT_ID=
YOUTUBE_OAUTH_CLIENT_SECRET=
YOUTUBE_OAUTH_REFRESH_TOKEN=
```

`ingest:for-you` then calls `subscriptions.list` and
`videos.list?myRating=like`, maps channel `topicDetails` into signal
weights, and writes imported ids into `data/sources/user-signals.json`.

Rotate or revoke credentials in Cloud Console if they leak. Never paste
real tokens into git, issues, or the README.

## Local signal store

- `data/sources/user-signals.json` — committed baseline (favorites-seeded
  weights, manual YouTube URLs, imported ids).
- `data/sources/liked.json` — gitignored runtime likes from the UI.
- `data/for-you/latest.json` — dated mix the `/for-you` page reads.

Debug dumps: `GET /api/for-you` and `GET /api/health` include
`LEARNED_TOPICS`.
