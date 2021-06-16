import {FavouritesGroup} from './favourites-group';

export abstract class Favouritable {
  protected constructor(public group: FavouritesGroup) {
  }

  abstract caption(): string;
}
