import {FavouritesGroup} from '../favourites-group';
import {Favouritable} from '../favouritable';

export class TopicMetadata extends Favouritable {
  constructor(public partitions: number, public group: FavouritesGroup, public name: string) {
    super(group);
  }

  public caption(): string {
    return this.name;
  }

}

export class Topics {
  topics: TopicMetadata[];
}
