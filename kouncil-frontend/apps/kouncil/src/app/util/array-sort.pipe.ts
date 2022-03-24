import {Injectable, Pipe, PipeTransform} from '@angular/core';
import {FavouritesGroup} from '../favourites-group';

@Injectable({
  providedIn: 'root'
})
@Pipe({
  name: 'arraySort'
})
export class ArraySortPipe implements PipeTransform {
  transform(value: any[], key: string, order: string): any {
    return [...value].sort((a, b) => this.compareValues(a, b, key, order));
  }

  private compareValues(a: any, b: any, key: string, order: string) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      return 0;
    }

    const varA = this.getValue(a, key);
    const varB = this.getValue(b, key);

    if (a.group === b.group) {
      return this.compareWithOrder(varA, varB, order);
    } else if (a.group === FavouritesGroup.GROUP_FAVOURITES) {
      return -1;
    } else if (b.group === FavouritesGroup.GROUP_FAVOURITES) {
      return 1;
    }
  }

  private compareWithOrder(varA: any, varB: any, order: string) {
    const comparison = varA.localeCompare(varB);
    return ((order === 'desc') ? (comparison * -1) : comparison);
  }

  private getValue(value: any, key: string): any {
    return (typeof value[key] === 'string') ? value[key].toUpperCase() : value[key];
  }
}
