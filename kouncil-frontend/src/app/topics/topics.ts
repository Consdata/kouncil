import {FavouritesGroup} from '../favourites-group';
import {Favouritable} from '../favouritable';

export class TopicMetadata implements Favouritable {
  constructor(public partitions: number, public group: FavouritesGroup, public name: string) {
  }

  public caption(): string {
    return this.name;
  }
}

export class Topics {
  topics: TopicMetadata[];
}
