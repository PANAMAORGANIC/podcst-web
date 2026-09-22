import { existsSync, readFileSync } from 'node:fs';
import os from 'node:os';

/** Skip the ~100MB gunzip on trial dynos unless CATALOG_FULL=1. */
export const FULL_CATALOG_MIN_BYTES = 768 * 1024 * 1024;
export const HOSTED_TRIAL_BYTES = 512 * 1024 * 1024;

export function cgroupMemoryLimitBytes(): number | null {
  const paths = [
    '/sys/fs/cgroup/memory.max',
    '/sys/fs/cgroup/memory/memory.limit_in_bytes',
  ];
  for (const file of paths) {
    if (!existsSync(file)) continue;
    try {
      const raw = readFileSync(file, 'utf8').trim();
      if (!raw || raw === 'max') continue;
      const n = Number(raw);
      if (Number.isFinite(n) && n > 0 && n < 1e15) return n;
    } catch {
      // host has no usable cgroup limit
    }
  }
  return null;
}

/** Railway/Render/Fly often report the host's totalmem, not trial RAM. */
export function hostedTrialFallbackBytes(
  env: Record<string, string | undefined> = process.env,
): number | null {
  if (
    env.RAILWAY_ENVIRONMENT ||
    env.RAILWAY_PROJECT_ID ||
    env.RENDER ||
    env.FLY_APP_NAME
  ) {
    return HOSTED_TRIAL_BYTES;
  }
  return null;
}

export function availableMemoryBytes(
  env: Record<string, string | undefined> = process.env,
): number {
  return (
    cgroupMemoryLimitBytes() ?? hostedTrialFallbackBytes(env) ?? os.totalmem()
  );
}

export function shouldLoadFullSnapshot(
  env: Record<string, string | undefined> = process.env,
  memoryBytes = availableMemoryBytes(env),
): boolean {
  const flag = env.CATALOG_FULL?.trim().toLowerCase();
  if (flag === '0' || flag === 'false') return false;
  if (flag === '1' || flag === 'true') return true;
  return memoryBytes >= FULL_CATALOG_MIN_BYTES;
}
