import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CachedCellData } from './cached-cell-data';
import { format } from 'date-fns';
import {ConsumerGroupOffset} from '@app/common-model';
import {ServersService} from '@app/common-servers';

export interface CachedCellDataViewModel {
  realValue: string | null;
  cache: CachedCellData;
}

@Injectable()
export class CachedCellService implements OnDestroy {
  private readonly LAST_SEEN_DATE_FORMAT: string = 'yyyy-MM-dd HH:mm:ss';

  private property?: string;

  private _vm$: BehaviorSubject<CachedCellDataViewModel> =
    new BehaviorSubject<CachedCellDataViewModel>({
      realValue: null,
      cache: {
        value: null,
        lastSeenTimestamp: null,
      },
    });

  constructor(private servers: ServersService) {}

  get vm$(): Observable<CachedCellDataViewModel> {
    return this._vm$.asObservable();
  }

  ngOnDestroy(): void {
    this._vm$.complete();
  }

  setProperty(property: string): void {
    this.property = property;
  }

  setRow(customerGroupOffset: ConsumerGroupOffset): void {
    if (!this.property) {
      return;
    }
    const newValue = customerGroupOffset[this.property];
    if (newValue) {
      if (newValue !== this._vm$.value.realValue) {
        this._vm$.next({
          ...this._vm$.value,
          realValue: newValue,
        });
      }
      this.cacheData(customerGroupOffset);
    } else {
      if (this._vm$.value.cache) {
        this.readCachedData(customerGroupOffset);
      }
    }
  }

  private cacheData(customerGroupOffset: ConsumerGroupOffset): void {
    if (this.property) {
      localStorage.setItem(
        this.calcStorageKey(customerGroupOffset),
        JSON.stringify({
          value: customerGroupOffset[this.property],
          lastSeenTimestamp: format(new Date(), this.LAST_SEEN_DATE_FORMAT),
        })
      );
    }
  }

  private readCachedData(customerGroupOffset: ConsumerGroupOffset): void {
    const newCachedData: string | null = localStorage.getItem(
      this.calcStorageKey(customerGroupOffset)
    );
    if (newCachedData) {
      const cachedCellData: CachedCellData = JSON.parse(newCachedData);
      this._vm$.next({
        realValue: null,
        cache: cachedCellData,
      });
    }
  }

  private calcStorageKey(customerGroupOffset: ConsumerGroupOffset): string {
    return `${this.servers.getSelectedServerId()}_${
      customerGroupOffset.topic
    }_${customerGroupOffset.partition}_${this.property}`;
  }
}
