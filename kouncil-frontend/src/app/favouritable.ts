import {FavouritesGroup} from './favourites-group';

export interface Favouritable {
  group: FavouritesGroup;
  caption(): string;
}
