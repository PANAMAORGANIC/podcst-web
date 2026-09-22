import { curatedHomeRails, isGenericDirectoryRail } from './curated';
import type { CatalogEntry } from './types';

export interface CatalogRail {
  id: string;
  title: string;
  lede: string;
  items: CatalogEntry[];
}

/** Owner home: taste-derived rails only. The ingest catalog stays a backend pool. */
export function homeRails(): CatalogRail[] {
  return curatedHomeRails().filter((rail) => !isGenericDirectoryRail(rail));
}
