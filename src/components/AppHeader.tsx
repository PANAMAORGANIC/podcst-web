'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { CloseIcon, MenuIcon } from './Icons';
import { SearchBox } from './SearchBox';
import { ThemeToggle } from './ThemeToggle';

const NAV = [
  { href: '/', label: 'Explore' },
  { href: '/podcasts', label: 'Podcasts' },
  { href: '/audiobooks', label: 'Audiobooks' },
  { href: '/youtube', label: 'YouTube' },
  { href: '/recommendations', label: 'For you' },
  { href: '/about', label: 'About' },
];

export function AppHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="wordmark">
          <span className="wordmark-mark" aria-hidden="true">
            WAR
          </span>
          <span className="wordmark-name">World Audio Repository</span>
        </Link>
        <nav className="site-nav" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-active={isActive(pathname, item.href)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="site-header-actions">
          {pathname !== '/' ? <SearchBox /> : null}
          <ThemeToggle />
          <button
            type="button"
            className="icon-btn menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
            <span className="sr-only">Menu</span>
          </button>
        </div>
      </div>
      {open ? (
        <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              data-active={isActive(pathname, item.href)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
