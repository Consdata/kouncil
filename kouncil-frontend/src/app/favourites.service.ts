import {Injectable} from '@angular/core';
import {FavouritesGroup} from './favourites-group';
import {Favouritable} from './favouritable';
import {TopicMetadata} from './topics/topics';

@Injectable({
  providedIn: 'root'
})
export class FavouritesService {

  constructor() { }

  private static parseFavourites(favouritesKey: string): string[] {
    const favouritesStr = localStorage.getItem(favouritesKey);
    let favourites = [];
    if (favouritesStr) {
      favourites = favouritesStr.split(',');
    }
    return favourites;
  }

  private static favouriteKey(topicName: string, serverId: string): string {
    return serverId + ';' + topicName;
  }

  public updateFavourites(row, favouritesKey: string, serverId: string) {
    const favourites = FavouritesService.parseFavourites(favouritesKey);
    if (row.group === FavouritesGroup.GROUP_FAVOURITES) {
      favourites.splice(favourites.indexOf(FavouritesService.favouriteKey(row.name, serverId)), 1);
    } else {
      favourites.push(FavouritesService.favouriteKey(row.name, serverId));
    }
    localStorage.setItem(favouritesKey, favourites.join());
  }

  public applyFavourites(elements: Favouritable[], favouritesKey: string, serverId: string) {
    const favourites = FavouritesService.parseFavourites(favouritesKey);
    elements.forEach(element => {
      element.setFavouriteGroup(favourites.indexOf(FavouritesService.favouriteKey(element.favouriteToken(), serverId)) > -1
        ? FavouritesGroup.GROUP_FAVOURITES
        : FavouritesGroup.GROUP_ALL);
    });
    elements.sort((a, b) => {
      if (a.favouriteGroup() === b.favouriteGroup()) {
        return a.favouriteToken().localeCompare(b.favouriteToken());
      } else if (a.favouriteGroup() === FavouritesGroup.GROUP_FAVOURITES) {
        return -1;
      } else if (b.favouriteGroup() === FavouritesGroup.GROUP_FAVOURITES) {
        return 1;
      }
    });
  }
}
