import {ConsumerGroup} from './consumer-groups';

export const demoConsumerGroups = [{
  'groupId': 'transaction-history',
  'status': 'Stable',
  'group': ConsumerGroup.GROUP_ALL
}, {
  'groupId': 'transaction-history-report',
  'status': 'Stable',
  'group': ConsumerGroup.GROUP_ALL
}, {
  'groupId': 'transaction-processing',
  'status': 'Stable',
  'group': ConsumerGroup.GROUP_ALL
}, {
  'groupId': 'currency-exchange-rate-aggregation',
  'status': 'Empty',
  'group': ConsumerGroup.GROUP_ALL
}, {
  'groupId': 'currency-exchange-stream',
  'status': 'Stable',
  'group': ConsumerGroup.GROUP_ALL
}];
