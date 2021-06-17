import {TestBed} from '@angular/core/testing';

import {FavouritesService} from './favourites.service';
import {TopicMetadata} from './topics/topics';
import {FavouritesGroup} from './favourites-group';

describe('FavouritesService', () => {
  let service: FavouritesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FavouritesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should mark favourite and sort topics', () => {
    const topics = [
      new TopicMetadata(4, null, 'bank-transactions'),
      new TopicMetadata(2, null, 'currency-rates'),
      new TopicMetadata(256, null, 'system-events')];

    service.updateFavourites(topics[1], 'test', 'serverId');
    service.applyFavourites(topics, 'test', 'serverId');

    // ulubiony jest pierwszy
    expect(topics[0].group).toEqual(FavouritesGroup.GROUP_FAVOURITES);
    expect(topics[0].name).toEqual('currency-rates');

    // reszta ma ustawiona grupe ALL
    expect(topics[1].group).toEqual(FavouritesGroup.GROUP_ALL);
    expect(topics[2].group).toEqual(FavouritesGroup.GROUP_ALL);
  });
});
