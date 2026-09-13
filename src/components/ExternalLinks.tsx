import type { CatalogEntry } from '@/catalog/types';
import { ExternalIcon } from './Icons';

const LABELS: Record<string, string> = {
  rss: 'Open RSS feed',
  youtube: 'Open on YouTube',
  website: 'Open website',
  store: 'Open store / publisher',
  librivox: 'Open on LibriVox',
  podcastIndex: 'Open in Podcast Index',
};

export function ExternalLinks({ entry }: { entry: CatalogEntry }) {
  const links = Object.entries(entry.externalUrls).filter(
    (row): row is [string, string] => Boolean(row[1]),
  );

  if (links.length === 0) {
    return (
      <p className="empty-state">
        No public deep link is recorded for this title yet.
      </p>
    );
  }

  return (
    <ul className="external-links">
      {links.map(([key, href]) => (
        <li key={key}>
          <a href={href} rel="noreferrer noopener" target="_blank">
            <ExternalIcon />
            {LABELS[key] ?? key}
          </a>
        </li>
      ))}
    </ul>
  );
}
