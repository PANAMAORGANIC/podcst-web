# Deploy World Audio Repository (phone HTTPS)

The catalogue file `data/catalog.json.gz` is about **24MB gzip / 100MB
raw** and expands in memory on first request. A long-running **Node 20**
process with **~1GB RAM** is the host that fits. This repo does not
include host tokens, so you publish it once from your own account.

The app is useful with **zero secrets**. Do not put API keys in git.
Optional env vars stay in the host dashboard (see `.env.example`).
Playback always streams the publisher enclosure or YouTube — we never
upload audio.

## Pick a host

| Host | Fits the catalog? | Why |
| --- | --- | --- |
| **Railway** (preferred) | Yes | Dockerfile, 1GB, GitHub deploy, HTTPS on `*.up.railway.app` |
| **Render** | Yes | Docker web service, `render.yaml` |
| **Fly.io** | Yes | `fly.toml` + Dockerfile, 1GB VM |
| Vercel Hobby | Usually no | Serverless size + cold-start gunzip of ~100MB |

Use Railway unless you already live on Render or Fly.

## Railway (about five minutes)

1. Open [https://railway.app](https://railway.app) and sign in with
   GitHub (free trial / Hobby is enough).
2. **New Project** → **Deploy from GitHub repo**.
3. Authorize Railway if asked, then pick
   **PANAMAORGANIC/podcst-web**.
4. Open **Settings → Source** (or the service’s branch picker) and set
   the branch to **`cursor/world-audio-repository-0e8f`** — not `main`.
   This PR is the product; `main` is still the old player.
5. Railway should detect the **Dockerfile**. If it offers Nixpacks
   instead: Settings → Build → Builder → **Dockerfile**.
6. Settings → **Networking** → **Generate Domain**. Copy the
   `https://….up.railway.app` URL.
7. **Target port (502s):** Settings → Networking → **Target port**
   must be the port the process listens on.
   - **Best:** delete any `PORT` variable you added. Railway injects
     `PORT`. Leave Target port empty (or set it to that same value).
   - If you keep `PORT=3000`, set Target port to **3000** as well.
   - Do not set `PORT` in the Dockerfile (the image does not).
   - `HOSTNAME` defaults to `0.0.0.0` in the container. You do not
     need to set it.
8. Wait until the deploy is **Success**. `/api/health` is cheap and
   must not gunzip the catalogue. Railway/Render/Fly default to the
   seed shelf (Acres, Radio Semilla, pins). Set `CATALOG_FULL=1` only
   on a **≥1GB** service when you want the 119k ingest pool.
9. Optional Variables — add only keys you actually have
   (`YOUTUBE_API_KEY`, LibreTranslate, Podcast Index,
   `AGENT_FEED_WEBHOOK_*`). Leave them blank otherwise. Do not set
   `PORT` unless it matches Target port.

Public URL: the generated Railway domain (this project:
`https://podcst-production.up.railway.app`).

### Railway 502 / timeouts

1. Deploy logs should show `[war] listen 0.0.0.0:<port>` — that
   `<port>` is what Target port must match.
2. `curl -sS https://podcst-production.up.railway.app/api/health`
   should return 200 in about a second. If it hangs, the proxy is
   not reaching the process (port mismatch) or the old image is
   still serving a health handler that loads the catalogue.
3. Homepage search of the 119k ingest pool needs ~1GB RAM. Trial
   RAM stays on the editorial seed (Acres, Radio Semilla, and the
   other pins still resolve).

## Render (same Dockerfile)

1. Open [https://dashboard.render.com](https://dashboard.render.com)
   and sign in with GitHub.
2. **New +** → **Blueprint** and point it at this repo, **or**
   **New Web Service** → this repo.
3. Branch: **`cursor/world-audio-repository-0e8f`**.
4. Runtime: **Docker**. Instance: at least **1GB** (Starter).
5. Health check path: `/api/health`.
6. Create the service. Copy the `https://….onrender.com` URL.

## Fly.io (same Dockerfile)

```bash
# once: https://fly.io/docs/hands-on/install-flyctl/
fly auth login
fly apps create world-audio-repository   # pick another name if taken
fly deploy --dockerfile Dockerfile
```

`fly.toml` expects 1GB. First `fly deploy` prints the
`https://….fly.dev` URL.

## Vercel (only if you insist)

`vercel.json` is present so `npx vercel` works, and `next.config.ts`
traces `data/catalog.json.gz` into the serverless bundle.

Expect failure or multi-second cold starts on Hobby: the gzip is ~24MB
and gunzip + parse is ~100MB+. If the build or function is rejected,
switch to Railway. Never commit a Vercel token.

```bash
npx vercel login
npx vercel --prod --yes
```

In the Vercel project, set the Git branch to
`cursor/world-audio-repository-0e8f` if you connect the GitHub repo.

## After you have an HTTPS URL

Smoke on a laptop, then the phone:

```bash
# Home (For You / Because you like / Explore / pins)
curl -sS "$URL/api/health" | head

# Acres U.S.A. + Radio Semilla
curl -sS "$URL/title/it-1747339811" | head
curl -sS "$URL/api/episodes/it-1747339811" | head
curl -sS "$URL/title/it-1547894245" | head
curl -sS "$URL/api/episodes/it-1547894245" | head
```

In the browser: open `/`, then those two title pages, tap **Play
latest**. If the enclosure is 403/CORS, the bar shows **Open in
source** — that is expected, not a deploy bug.

### Add to Home Screen

- **iPhone (Safari):** open the URL → Share → **Add to Home Screen** →
  Add. WAR should use the dark icon and open full-screen.
- **Android (Chrome):** menu → **Add to Home screen** / Install app.

Likes and playhead stay on that phone (`localStorage`). They do not
sync across devices unless you later add a store. `/api/likes` writes
`data/sources/liked.json` only when the disk is writable (local ingest
machine). On Railway/Render/Fly it returns `persisted: false` and the
UI still works.

## Local production check (optional)

```bash
npm ci
npm run build   # next build + copies public/static into standalone
npm start       # node .next/standalone/listen.cjs (PORT or 3000)
# open http://localhost:3000
```

Or:

```bash
docker build -t war .
docker run --rm -p 3000:3000 war
```

## What not to do

- Do not deploy `main` until this PR is the default branch you want.
- Do not upload MP3s, YouTube files, or any media to the host.
- Do not commit `.env`, Railway/Vercel/Fly tokens, or API keys.
- Do not scrape Castbox or the YouTube homepage.
