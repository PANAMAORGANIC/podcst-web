import type { Metadata } from 'next';
import { TypeBrowse } from '@/components/TypeBrowse';

export const metadata: Metadata = {
  title: 'Podcasts',
  description: 'Browse podcasts across languages and regions.',
};

export default function PodcastsPage() {
  return (
    <TypeBrowse
      type="podcast"
      title="Podcasts"
      lede="Independent desks, public radio, and language services. Feeds when we have them; websites when that is the honest record."
    />
  );
}
