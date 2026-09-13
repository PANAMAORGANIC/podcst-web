import type { Metadata } from 'next';
import { TypeBrowse } from '@/components/TypeBrowse';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'YouTube',
  description: 'Long-form video channels treated as an audio-adjacent archive.',
};

export default function YouTubePage() {
  return (
    <TypeBrowse
      type="youtube"
      title="YouTube"
      lede="Channels and series that behave like spoken archives: lectures, correspondents, podcasts on YouTube. Curated pack plus For You topic search — not a homepage scrape. Open on YouTube."
    />
  );
}
