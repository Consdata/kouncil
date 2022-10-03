import {Favouritable, FavouritesGroup} from '@app/feat-favourites';

export class ConsumerGroup implements Favouritable {
  constructor(public groupId: string, public status: string, public group: (FavouritesGroup | null)) {
  }

  public caption(): string {
    return this.groupId;
  }

}

export class ConsumerGroupsResponse {
  consumerGroups: ConsumerGroup[];
}
