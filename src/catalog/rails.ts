import { queryCatalog } from './query';
import { CATALOG } from './seed';
import type { CatalogEntry } from './types';

export interface CatalogRail {
  id: string;
  title: string;
  lede: string;
  items: CatalogEntry[];
}

const UNDERREPRESENTED = new Set([
  'am',
  'cy',
  'eu',
  'ha',
  'km',
  'mi',
  'ne',
  'qu',
  'sa',
  'so',
  'ta',
  'yo',
  'zu',
]);

export function homeRails(): CatalogRail[] {
  const beyondCharts = [...CATALOG]
    .sort((a, b) => b.signals.diversity - a.signals.diversity)
    .slice(0, 10);

  const publicDomain = CATALOG.filter(
    (item) =>
      item.tags.includes('public-domain') ||
      item.tags.includes('librivox') ||
      Boolean(item.externalUrls.librivox),
  ).slice(0, 10);

  const fromTheSouth = CATALOG.filter((item) =>
    [
      'andes',
      'arabia',
      'east-africa',
      'horn-of-africa',
      'india',
      'latin-america',
      'lusophone-africa',
      'maghreb',
      'mesoamerica',
      'sahel',
      'southeast-asia',
      'southern-africa',
      'west-africa',
    ].includes(item.region),
  )
    .sort((a, b) => b.signals.diversity - a.signals.diversity)
    .slice(0, 10);

  const minorityLanguages = CATALOG.filter((item) =>
    UNDERREPRESENTED.has(item.originalLanguage),
  ).slice(0, 10);

  const longVideo = queryCatalog({
    type: 'youtube',
    sort: 'diversity',
    limit: 10,
  }).items;

  return [
    {
      id: 'beyond-charts',
      title: 'Beyond the usual charts',
      lede: 'Weighted for linguistic and regional range, not download rank.',
      items: beyondCharts,
    },
    {
      id: 'public-domain',
      title: 'Open voices',
      lede: 'Public-domain recitations and volunteer libraries. Listen where the licence is already free.',
      items: publicDomain,
    },
    {
      id: 'global-south',
      title: 'From the Global South',
      lede: 'Desks, epics, and channels that do not treat London or Los Angeles as the default centre.',
      items: fromTheSouth,
    },
    {
      id: 'fewer-records',
      title: 'Languages with fewer records',
      lede: 'Cataloguing is uneven. These titles keep smaller and historically suppressed languages on the first page.',
      items: minorityLanguages,
    },
    {
      id: 'long-video',
      title: 'Long-form on video',
      lede: 'YouTube as an audio-adjacent archive: lectures, correspondents, blackboards.',
      items: longVideo,
    },
  ];
}
