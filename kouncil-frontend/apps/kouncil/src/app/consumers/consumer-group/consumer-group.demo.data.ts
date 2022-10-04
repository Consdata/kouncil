/* eslint-disable @typescript-eslint/naming-convention */
export const demoConsumerGroup = {
  'transaction-processing': [{
    'consumerId': 'bank-transaction-consumer-12208701-99a7-4e9a-8a0e-bbc8970319de',
    'clientId': 'bank-transaction-consumer',
    'host': '/172.17.0.1',
    'partition': 1,
    'topic': 'bank-transactions',
    'offset': 3400419,
    'endOffset': 3400419
  }, {
    'consumerId': 'bank-transaction-consumer-12208701-99a7-4e9a-8a0e-bbc8970319de',
    'clientId': 'bank-transaction-consumer',
    'host': '/172.17.0.2',
    'partition': 2,
    'topic': 'bank-transactions',
    'offset': 3600372,
    'endOffset': 3600372
  }, {
    'consumerId': 'bank-transaction-consumer-8b052550-d0fe-4f67-98e6-40982c55ba40',
    'clientId': 'bank-transaction-consumer',
    'host': '/172.17.0.3',
    'partition': 3,
    'topic': 'bank-transactions',
    'offset': 4836451,
    'endOffset': 4836451
  }, {
    'consumerId': 'bank-transaction-consumer-8b052550-d0fe-4f67-98e6-40982c55ba40',
    'clientId': 'bank-transaction-consumer',
    'host': '/172.17.0.4',
    'partition': 4,
    'topic': 'bank-transactions',
    'offset': 6013017,
    'endOffset': 6013017
  }],
  'currency-exchange-rate-aggregation': [{
    'consumerId': 'currency-aggregation-consumer-34bfcc58-9c58-11eb-a8b3-0242ac130003',
    'clientId': 'currency-aggregation-consumer',
    'host': '/172.17.10.10',
    'partition': 1,
    'topic': 'currency-rates',
    'offset': 98237459343,
    'endOffset': 98237459343
  }, {
    'consumerId': 'currency-aggregation-consumer-7035a9ec-9c58-11eb-a8b3-0242ac130003',
    'clientId': 'currency-aggregation-consumer',
    'host': '/172.17.10.11',
    'partition': 2,
    'topic': 'currency-rates',
    'offset': 96349534587,
    'endOffset': 96349534587
  }],
  'currency-exchange-stream': [{
    'consumerId': 'currency-exchange-stream-consumer-375f7af0-9c5b-11eb-a8b3-0242ac130003',
    'clientId': 'currency-exchange-stream-consumer',
    'host': '/172.17.10.12',
    'partition': 1,
    'topic': 'currency-rates',
    'offset': 98237459343,
    'endOffset': 98237459343
  }, {
    'consumerId': 'currency-exchange-stream-consumer-3f359a48-9c5b-11eb-a8b3-0242ac130003',
    'clientId': 'currency-exchange-stream-consumer',
    'host': '/172.17.10.13',
    'partition': 2,
    'topic': 'currency-rates',
    'offset': 96349534587,
    'endOffset': 96349534587
  }],
  'transaction-history': [],
  'transaction-history-report': []
};
/* eslint-enable */
