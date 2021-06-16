import {FavouritesGroup} from '../../favourites-group';
import {Favouritable} from '../../favouritable';

export class ConsumerGroup implements Favouritable {
  constructor(public groupId: string, public status: string, public group: FavouritesGroup) {
  }

  public favouriteToken(): string {
    return this.groupId;
  }

  public favouriteGroup(): FavouritesGroup {
    return this.group;
  }

  setFavouriteGroup(group: FavouritesGroup): void {
    this.group = group;
  }

}

export class ConsumerGroupsResponse {
  consumerGroups: ConsumerGroup[];
}
