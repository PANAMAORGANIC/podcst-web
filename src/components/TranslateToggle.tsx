'use client';

import { TranslateIcon } from './Icons';

export function TranslateToggle({
  enabled,
  available,
  onToggle,
}: {
  enabled: boolean;
  available: boolean;
  onToggle: () => void;
}) {
  if (!available) {
    return (
      <p className="translate-note">
        Original language is English. Nothing to translate.
      </p>
    );
  }

  return (
    <button
      type="button"
      className="btn btn-ghost"
      aria-pressed={enabled}
      onClick={onToggle}
    >
      <TranslateIcon />
      {enabled ? 'Show original' : 'Translate titles and descriptions'}
    </button>
  );
}
