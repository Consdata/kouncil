export class ConsumerGroup {
  static GROUP_FAVOURITES = 'FAVOURITES';
  static GROUP_ALL = 'ALL';

  constructor(public groupId: string, public protocolType: string, public group: string) {

  };
}


export class ConsumerGroupsResponse {
  consumerGroups: ConsumerGroup[];
}
