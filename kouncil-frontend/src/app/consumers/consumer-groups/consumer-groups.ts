import {FavouritesGroup} from '../../favourites-group';
import {Favouritable} from '../../favouritable';

export class ConsumerGroup extends Favouritable {
  constructor(public groupId: string, public status: string, public group: FavouritesGroup) {
    super(group);
  }

  public caption(): string {
    return this.groupId;
  }

}

export class ConsumerGroupsResponse {
  consumerGroups: ConsumerGroup[];
}
