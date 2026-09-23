import favoritesFile from '../../data/sources/favorites.json';
import {
  type FavoriteShow,
  type FavoritesFile,
  favoriteId,
} from '../../scripts/lib/favorites';

/** Bundled at build time so Railway/standalone never need cwd or gunzip. */
export const BUNDLED_FAVORITES = favoritesFile as FavoritesFile;

export function bundledFavoriteShows(): FavoriteShow[] {
  return BUNDLED_FAVORITES.shows ?? [];
}

export function bundledFavoriteIds(): string[] {
  return bundledFavoriteShows().map((show) => favoriteId(show));
}
