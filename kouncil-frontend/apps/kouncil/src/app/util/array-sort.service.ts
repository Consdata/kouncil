import {Injectable} from '@angular/core';
import {FavouritesGroup} from '../favourites-group';
import {TopicMetadata} from '../topics/topics';
import {ConsumerGroup} from '../consumers/consumer-groups/consumer-groups';

@Injectable({
  providedIn: 'root'
})
export class ArraySortService {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(value: TopicMetadata[] | ConsumerGroup[], key: string, order: string): any {
    return [...value].sort((a, b) => this.compareValues(a, b, key, order));
  }

  private compareValues(a: TopicMetadata | ConsumerGroup, b: TopicMetadata | ConsumerGroup, key: string, order: string): number {
    if (!Object.prototype.hasOwnProperty.call(a, key) || !Object.prototype.hasOwnProperty.call(b, key)) {
      return 0;
    }


    const varA = this.getValue(a, key);
    const varB = this.getValue(b, key);

    if (a.group === b.group) {
      if (typeof varA === 'string' && typeof varB === 'string') {
        return this.compareStrings(varA, varB, order);
      } else if (typeof varA === 'number' && typeof varB === 'number') {
        const comparison = varA > varB ? 1 : -1;
        return ((order === 'desc') ? (comparison * -1) : comparison);
      }
    } else if (a.group === FavouritesGroup.GROUP_FAVOURITES) {
      return -1;
    } else if (b.group === FavouritesGroup.GROUP_FAVOURITES) {
      return 1;
    }
    return 0;
  }

  private compareStrings(varA: string, varB: string, order: string) {
    const comparison = varA.localeCompare(varB);
    return ((order === 'desc') ? (comparison * -1) : comparison);
  }

  private getValue(value: TopicMetadata | ConsumerGroup, key: string): unknown {
    const val = value[key];
    return (typeof val === 'string') ? val.toUpperCase() : value[key];
  }
}
