import {FavouritesGroup} from '../favourites-group';
import {Favouritable} from '../favouritable';

export class TopicMetadata implements Favouritable {
  constructor(public partitions: number, public group: FavouritesGroup, public name: string) {
  }

  public favouriteToken(): string {
    return this.name;
  }

  public favouriteGroup(): FavouritesGroup {
    return this.group;
  }

  setFavouriteGroup(group: FavouritesGroup): void {
    this.group = group;
  }
}

export class Topics {
  topics: TopicMetadata[];
}
