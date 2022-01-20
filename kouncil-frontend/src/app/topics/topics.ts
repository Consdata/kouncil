import {FavouritesGroup} from '../favourites-group';
import {Favouritable} from '../favouritable';

export class TopicMetadata implements Favouritable {
  constructor(public partitions: number, public group: (FavouritesGroup | null), public name: string) {
  }

  public caption(): string {
    return this.name;
  }
}

export interface Topics {
  topics: TopicMetadata[];
}
