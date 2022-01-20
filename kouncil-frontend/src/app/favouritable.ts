import {FavouritesGroup} from './favourites-group';

export interface Favouritable {
  group: FavouritesGroup | null;

  caption(): string;
}
