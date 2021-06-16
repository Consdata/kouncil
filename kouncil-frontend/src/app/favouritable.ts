import {FavouritesGroup} from './favourites-group';

export interface Favouritable {
  favouriteToken(): string;

  favouriteGroup(): FavouritesGroup;

  setFavouriteGroup(group: FavouritesGroup): void;

}
