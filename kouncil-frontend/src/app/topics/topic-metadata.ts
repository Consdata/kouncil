export class TopicMetadata {
  static GROUP_FAVOURITES = 'FAVOURITES';
  static GROUP_ALL = 'ALL';

  constructor(public partitions: number, public group: string, public name: string) {

  }
}
