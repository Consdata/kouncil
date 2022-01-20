import {Injectable} from '@angular/core';
import {FavouritesGroup} from './favourites-group';
import {Favouritable} from './favouritable';

@Injectable({
  providedIn: 'root'
})
export class FavouritesService {

  private static parseFavourites(favouritesKey: string): string[] {
    const favouritesStr = localStorage.getItem(favouritesKey);
    let favourites: string[] = [];
    if (favouritesStr) {
      favourites = favouritesStr.split(',');
    }
    return favourites;
  }

  private static favouriteKey(token: string, serverId: string): string {
    return serverId + ';' + token;
  }

  public updateFavourites(row: Favouritable, favouritesKey: string, serverId: string): void {
    const favourites = FavouritesService.parseFavourites(favouritesKey);
    if (row.group === FavouritesGroup.GROUP_FAVOURITES) {
      favourites.splice(favourites.indexOf(FavouritesService.favouriteKey(row.caption(), serverId)), 1);
    } else {
      favourites.push(FavouritesService.favouriteKey(row.caption(), serverId));
    }
    localStorage.setItem(favouritesKey, favourites.join());
  }

  public applyFavourites(elements: Favouritable[], favouritesKey: string, serverId: string): void {
    if (!elements) {
      return;
    }
    const favourites = FavouritesService.parseFavourites(favouritesKey);
    elements.forEach(element => {
      element.group = favourites.indexOf(FavouritesService.favouriteKey(element.caption(), serverId)) > -1
        ? FavouritesGroup.GROUP_FAVOURITES
        : FavouritesGroup.GROUP_ALL;
    });
    elements.sort((a: Favouritable, b: Favouritable) => {
      if (a.group === b.group) {
        return a.caption().localeCompare(b.caption());
      } else if (a.group === FavouritesGroup.GROUP_FAVOURITES) {
        return -1;
      } else if (b.group === FavouritesGroup.GROUP_FAVOURITES) {
        return 1;
      }
      return -1;
    });
  }
}
