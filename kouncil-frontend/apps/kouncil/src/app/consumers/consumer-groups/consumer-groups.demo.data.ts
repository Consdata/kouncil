
import {ConsumerGroup} from './consumer-groups';
import {FavouritesGroup} from '@app/feat-favourites';

export const demoConsumerGroups: ConsumerGroup[] = [
  new ConsumerGroup('transaction-processing', 'Stable', FavouritesGroup.GROUP_ALL),
  new ConsumerGroup('transaction-history', 'Empty', FavouritesGroup.GROUP_ALL),
  new ConsumerGroup('transaction-history-report', 'Empty', FavouritesGroup.GROUP_ALL),
  new ConsumerGroup('currency-exchange-rate-aggregation', 'Stable', FavouritesGroup.GROUP_ALL),
  new ConsumerGroup('currency-exchange-stream', 'Stable', FavouritesGroup.GROUP_ALL)];
