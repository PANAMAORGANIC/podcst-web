import type { Metadata, Viewport } from 'next';
import { AppFooter } from '@/components/AppFooter';
import { AppHeader } from '@/components/AppHeader';
import { PlayerRoot } from '@/components/player/PlayerRoot';
import { ThemeListener } from '@/theme/ThemeListener';
import '@/styles/global.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://worldaudiorepository.org'),
  title: {
    default: 'World Audio Repository',
    template: '%s — World Audio Repository',
  },
  description:
    'A curated shelf for RED — For You and related finds from likes and YouTube signals, not a public podcast directory.',
  applicationName: 'World Audio Repository',
  openGraph: {
    title: 'World Audio Repository',
    siteName: 'World Audio Repository',
    type: 'website',
    locale: 'en_US',
    description:
      'Personalized mix from owner favorites, likes, and YouTube signals.',
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  width: 'device-width',
  themeColor: '#141311',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeListener />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <AppHeader />
        <main id="main">{children}</main>
        <AppFooter />
        <PlayerRoot />
      </body>
    </html>
  );
}
