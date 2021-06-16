import {FavouritesGroup} from '../favourites-group';

export const demoTopics = [
  {
    'name': 'bank-transactions',
    'partitions': 4,
    'group': FavouritesGroup.GROUP_ALL
  }, {
    'name': 'currency-rates',
    'partitions': 2,
    'group': FavouritesGroup.GROUP_ALL
  }, {
    'name': 'system-events',
    'partitions': 256,
    'group': FavouritesGroup.GROUP_ALL
  }, {
    'name': 'user-audit-actions',
    'partitions': 256,
    'group': FavouritesGroup.GROUP_ALL
  }, {
    'name': 'frontend-activity-monitoring',
    'partitions': 128,
    'group': FavouritesGroup.GROUP_ALL
  }, {
    'name': 'user-reports',
    'partitions': 16,
    'group': FavouritesGroup.GROUP_ALL
  }
];
