import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'World Audio Repository',
    short_name: 'WAR',
    description:
      'A curated shelf for RED — For You and related finds. Source streams only.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#141311',
    theme_color: '#141311',
    lang: 'en',
    categories: ['music', 'entertainment'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
