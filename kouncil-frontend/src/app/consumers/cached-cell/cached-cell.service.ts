import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {CachedCellData} from './cached-cell-data';
import {ConsumerGroupOffset} from '../consumer-group/consumer-group';
import {ServersService} from '../../servers.service';
import {format} from 'date-fns'

export interface CachedCellDataViewModel {
  realValue: string,
  cache: CachedCellData
}

@Injectable()
export class CachedCellService implements OnDestroy {
  private readonly LAST_SEEN_DATE_FORMAT: string = 'yyyy-MM-dd HH:mm:ss';

  private property: string;

  private _vm$: BehaviorSubject<CachedCellDataViewModel> = new BehaviorSubject<CachedCellDataViewModel>({
    realValue: '',
    cache: {
      value: null,
      lastSeenTimestamp: null
    }
  });

  constructor(private servers: ServersService) {
  }

  get vm$(): Observable<CachedCellDataViewModel> {
    return this._vm$.asObservable();
  }

  ngOnDestroy(): void {
    this._vm$.complete();
  }

  setProperty(property: string) {
    this.property = property;
  }

  setRow(customerGroupOffset: ConsumerGroupOffset) {
    if (!this.property) {
      return;
    }
    const newValue = customerGroupOffset[this.property];
    if (newValue) {
      this._vm$.next(
        {
          ...this._vm$.getValue(),
          realValue: newValue
        });
      console.log('save cache', newValue);
      this.cacheData(customerGroupOffset);
    } else {
      console.log('read from cache');
      if (!!this._vm$.getValue().cache) {
        this.readCachedData(customerGroupOffset);
      }
    }
  }

  private cacheData(newRow: ConsumerGroupOffset): void {
    this._vm$.next(
      {
        ...this._vm$.getValue(),
        cache: {
          value: newRow[this.property],
          lastSeenTimestamp: format(new Date(), this.LAST_SEEN_DATE_FORMAT)
        }
      });
    localStorage.setItem(this.calcStorageKey(newRow), JSON.stringify(this._vm$.getValue().cache));
  }

  private readCachedData(newRow: ConsumerGroupOffset): void {
    const newCachedData: string = localStorage.getItem(this.calcStorageKey(newRow));
    if (newCachedData) {
      const cachedCellData: CachedCellData = JSON.parse(newCachedData);
      this._vm$.next(
        {
          realValue: null,
          cache: cachedCellData
        });
    }
  }

  private calcStorageKey(row: ConsumerGroupOffset): string {
    return `${this.servers.getSelectedServerId()}_${row.topic}_${row.partition}_${this.property}`;
  }

}
