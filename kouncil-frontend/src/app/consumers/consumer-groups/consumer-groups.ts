import {FavouritesGroup} from '../../favourites-group';
import {Favouritable} from '../../favouritable';

export interface ConsumerGroup extends Favouritable {
  groupId: string;
  status: string;
  group?: FavouritesGroup | null;
}

export class ConsumerGroupsResponse {
  consumerGroups: ConsumerGroup[];
}
