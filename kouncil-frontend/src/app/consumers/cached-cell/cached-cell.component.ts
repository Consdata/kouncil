import {Component, Input} from '@angular/core';
import {ConsumerGroupOffset} from '../consumer-group/consumer-group';
import {ServersService} from '../../servers.service';
import {CachedCellData} from './cached-cell-data';
import * as moment from 'moment';

@Component({
  selector: 'cached-cell',
  templateUrl: './cached-cell.component.html',
  styleUrls: ['./cached-cell.component.scss']
})
export class CachedCellComponent {

  private readonly LAST_SEEN_DATE_FORMAT: string = 'YYYY-MM-DD HH:mm:ss';

  private readonly NO_DATA_LABEL: string = 'NO DATA';

  public cachedData: CachedCellData;

  private _row: ConsumerGroupOffset;

  @Input()
  public showLastSeenTimestamp: boolean = false;

  @Input()
  public property: string;

  @Input()
  public set row(newRow: ConsumerGroupOffset) {
    if (this.shouldBeCached(newRow)) {
      this.cacheData(newRow);
    }

    this._row = newRow;

    if (!this.cachedData) {
      this.readCachedData();
    }
  };

  public get row(): ConsumerGroupOffset {
    return this._row;
  }

  constructor(private servers: ServersService) { }

  private shouldBeCached(newRow: ConsumerGroupOffset): boolean {
    return newRow[this.property] && (!this.row || newRow[this.property] != this.row[this.property]);
  }

  private cacheData(newRow: ConsumerGroupOffset): void {
    this.cachedData = {
      cachedValue: newRow[this.property],
      lastSeenTimestamp: moment().format(this.LAST_SEEN_DATE_FORMAT)
    };
    localStorage.setItem(this.getLocalStorageKey(newRow), JSON.stringify(this.cachedData));
  }

  private readCachedData(): void {
    const newCachedData: string = localStorage.getItem(this.getLocalStorageKey(this.row));
    if (newCachedData) {
      this.cachedData = JSON.parse(newCachedData);
    }
  }

  private getLocalStorageKey(row: ConsumerGroupOffset): string {
    return `${this.servers.getSelectedServerId()}_${row.topic}_${row.partition}_${this.property}`;
  }

  public getValue(): string {
    return this.row[this.property]
      ? this.row[this.property]
      : this.cachedData?.cachedValue ?? this.NO_DATA_LABEL;
  }

  public showCachedValue(): boolean {
    return !this.row[this.property];
  }

  public showLastSeenTimestampLabel(): boolean {
    return this.showLastSeenTimestamp && this.showCachedValue() && !!this.cachedData?.lastSeenTimestamp;
  }
}
