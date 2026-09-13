import type { Metadata, Viewport } from 'next';
import { AppFooter } from '@/components/AppFooter';
import { AppHeader } from '@/components/AppHeader';
import { ThemeListener } from '@/theme/ThemeListener';
import '@/styles/global.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://worldaudiorepository.org'),
  title: {
    default: 'World Audio Repository',
    template: '%s — World Audio Repository',
  },
  description:
    'A global catalogue of podcasts, audiobooks, and long-form YouTube — built for linguistic and regional range, not a single chart.',
  applicationName: 'World Audio Repository',
  openGraph: {
    title: 'World Audio Repository',
    siteName: 'World Audio Repository',
    type: 'website',
    locale: 'en_US',
    description:
      'Search and browse the spoken record across languages, regions, and formats.',
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
      </body>
    </html>
  );
}
