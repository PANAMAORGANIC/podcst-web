import type { Metadata } from 'next';
import { TypeBrowse } from '@/components/TypeBrowse';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Audiobooks',
  description: 'Public-domain recitations and copyrighted titles as metadata.',
};

export default function AudiobooksPage() {
  return (
    <TypeBrowse
      type="audiobook"
      title="Audiobooks"
      lede="LibriVox-class public-domain readings sit beside modern novels that we only catalogue. We never host the file."
    />
  );
}
