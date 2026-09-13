import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'World Audio Repository',
    short_name: 'WAR',
    description:
      'A global catalogue of podcasts, audiobooks, and long-form YouTube.',
    start_url: '/',
    display: 'standalone',
    background_color: '#141311',
    theme_color: '#141311',
    lang: 'en',
  };
}
