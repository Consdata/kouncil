import {ConsumerGroup} from './consumer-groups';

export const demoConsumerGroups = [{
  'groupId': 'transaction-processing',
  'status': 'Stable',
  'group': ConsumerGroup.GROUP_ALL
}, {
  'groupId': 'transaction-history',
  'status': 'Empty',
  'group': ConsumerGroup.GROUP_ALL
}, {
  'groupId': 'transaction-history-report',
  'status': 'Empty',
  'group': ConsumerGroup.GROUP_ALL
}, {
  'groupId': 'currency-exchange-rate-aggregation',
  'status': 'Stable',
  'group': ConsumerGroup.GROUP_ALL
}, {
  'groupId': 'currency-exchange-stream',
  'status': 'Stable',
  'group': ConsumerGroup.GROUP_ALL
}];
