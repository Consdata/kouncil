import { Injectable } from '@angular/core';
import {FavouritesGroup} from './favourites-group';

@Injectable({
  providedIn: 'root'
})
export class FavouritesService {

  constructor() { }

  public updateFavourites(row, favouritesKey: string, serverId: string) {
    const favourites = this.parseFavourites(favouritesKey);
    if (row.group === FavouritesGroup.GROUP_FAVOURITES) {
      favourites.splice(favourites.indexOf(this.favouriteKey(row.name, serverId)), 1);
    } else {
      favourites.push(this.favouriteKey(row.name, serverId));
    }
    localStorage.setItem(favouritesKey, favourites.join());
  }

  public applyFavourites(elements, favouritesKey: string, serverId: string) {
    const favourites = this.parseFavourites(favouritesKey);
    elements.forEach(topic => {
      topic.group = favourites.indexOf(this.favouriteKey(topic.name, serverId)) > -1
        ? FavouritesGroup.GROUP_FAVOURITES
        : FavouritesGroup.GROUP_ALL;
    });
    elements.sort((a, b) => {
      if (a.group === b.group) {
        return a.name.localeCompare(b.name);
      } else if (a.group === FavouritesGroup.GROUP_FAVOURITES) {
        return -1;
      } else if (b.group === FavouritesGroup.GROUP_FAVOURITES) {
        return 1;
      }
    });
  }

  private parseFavourites(favouritesKey: string): string[] {
    const favouritesStr = localStorage.getItem(favouritesKey);
    let favourites = [];
    if (favouritesStr) {
      favourites = favouritesStr.split(',');
    }
    return favourites;
  }

  private favouriteKey(topicName: string, serverId: string): string {
    return serverId + ';' + topicName;
  }
}
