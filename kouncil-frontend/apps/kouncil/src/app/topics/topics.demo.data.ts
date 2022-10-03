import {TopicMetadata} from './topics';
import {FavouritesGroup} from '@app/feat-favourites';

export const demoTopics = [
  new TopicMetadata(4, FavouritesGroup.GROUP_ALL, 'bank-transactions'),
  new TopicMetadata(2, FavouritesGroup.GROUP_ALL, 'currency-rates'),
  new TopicMetadata(256, FavouritesGroup.GROUP_ALL, 'system-events'),
  new TopicMetadata(256, FavouritesGroup.GROUP_ALL, 'user-audit-actions'),
  new TopicMetadata(128, FavouritesGroup.GROUP_ALL, 'frontend-activity-monitoring'),
  new TopicMetadata(16, FavouritesGroup.GROUP_ALL, 'user-reports')
];
