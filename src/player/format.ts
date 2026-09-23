export function formatClock(seconds: number | undefined): string {
  if (seconds === undefined || !Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = total % 60;
  const mm = hours > 0 ? String(minutes).padStart(2, '0') : String(minutes);
  const ss = String(rest).padStart(2, '0');
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function formatPublished(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export const IN_PROGRESS_MIN = 12;
export const COMPLETED_RATIO = 0.92;

export function progressState(
  currentTime: number | undefined,
  duration: number | undefined,
): 'unplayed' | 'in-progress' | 'played' {
  if (!currentTime || currentTime < IN_PROGRESS_MIN) return 'unplayed';
  if (duration && duration > 0 && currentTime / duration >= COMPLETED_RATIO) {
    return 'played';
  }
  return 'in-progress';
}

export function progressRatio(
  currentTime: number | undefined,
  duration: number | undefined,
): number {
  if (!currentTime || !duration || duration <= 0) return 0;
  return Math.min(1, Math.max(0, currentTime / duration));
}
