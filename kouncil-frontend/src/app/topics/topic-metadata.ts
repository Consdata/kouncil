import {FavouritesGroup} from '../favourites-group';

export class TopicMetadata {
  constructor(public partitions: number, public group: FavouritesGroup, public name: string) {
  }
}
