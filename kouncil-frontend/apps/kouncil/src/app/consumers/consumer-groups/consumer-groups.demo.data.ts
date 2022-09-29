import {FavouritesGroup} from '../../favourites-group';
import {ConsumerGroup} from './consumer-groups';

export const demoConsumerGroups: ConsumerGroup[] = [
  new ConsumerGroup('transactionProcessing', 'Stable', FavouritesGroup.GROUP_ALL),
  new ConsumerGroup('transactionHistory', 'Empty', FavouritesGroup.GROUP_ALL),
  new ConsumerGroup('transactionHistoryReport', 'Empty', FavouritesGroup.GROUP_ALL),
  new ConsumerGroup('currencyExchangeRateAggregation', 'Stable', FavouritesGroup.GROUP_ALL),
  new ConsumerGroup('currencyExchangeStream', 'Stable', FavouritesGroup.GROUP_ALL)];
