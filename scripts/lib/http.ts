/** Shared fetch helpers for ingest scripts. Metadata only — no media. */

const UA =
  'WorldAudioRepository/1.0 (+https://github.com/PANAMAORGANIC/podcst-web)';

export async function fetchJson<T>(
  url: string | URL,
  options: {
    headers?: Record<string, string>;
    timeoutMs?: number;
    retries?: number;
    method?: string;
    body?: string;
  } = {},
): Promise<{ ok: true; data: T } | { ok: false; status: number }> {
  const timeoutMs = options.timeoutMs ?? 25_000;
  const retries = options.retries ?? 2;
  let lastStatus = 0;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        method: options.method ?? 'GET',
        body: options.body,
        headers: { 'User-Agent': UA, ...options.headers },
      });
      lastStatus = response.status;
      if (response.status === 429 && attempt < retries) {
        await sleep(800 * (attempt + 1));
        continue;
      }
      if (!response.ok) {
        return { ok: false, status: response.status };
      }
      return { ok: true, data: (await response.json()) as T };
    } catch {
      if (attempt < retries) {
        await sleep(400 * (attempt + 1));
        continue;
      }
      return { ok: false, status: lastStatus || 0 };
    } finally {
      clearTimeout(timer);
    }
  }

  return { ok: false, status: lastStatus || 0 };
}

export async function fetchText(
  url: string | URL,
  options: {
    headers?: Record<string, string>;
    timeoutMs?: number;
    retries?: number;
  } = {},
): Promise<{ ok: true; data: string } | { ok: false; status: number }> {
  const timeoutMs = options.timeoutMs ?? 25_000;
  const retries = options.retries ?? 2;
  let lastStatus = 0;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': UA,
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
          ...options.headers,
        },
      });
      lastStatus = response.status;
      if (response.status === 429 && attempt < retries) {
        await sleep(800 * (attempt + 1));
        continue;
      }
      if (!response.ok) {
        return { ok: false, status: response.status };
      }
      return { ok: true, data: await response.text() };
    } catch {
      if (attempt < retries) {
        await sleep(400 * (attempt + 1));
        continue;
      }
      return { ok: false, status: lastStatus || 0 };
    } finally {
      clearTimeout(timer);
    }
  }

  return { ok: false, status: lastStatus || 0 };
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
