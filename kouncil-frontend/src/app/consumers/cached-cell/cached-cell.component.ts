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

  private readonly LAST_SEEN_DATE_FORMAT: string = 'YYYY-MM-DD HH:mm:SS';

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
      this.cacheData();
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
    return this.row && this.row[this.property] && !newRow[this.property];
  }

  private cacheData(): void {
    this.cachedData = {
      cachedValue: this.row[this.property],
      lastSeenTimestamp: moment().format(this.LAST_SEEN_DATE_FORMAT)
    };
    localStorage.setItem(this.getLocalStorageKey(), JSON.stringify(this.cachedData));
  }

  private readCachedData(): void {
    const newCachedData: string = localStorage.getItem(this.getLocalStorageKey());
    if (newCachedData) {
      this.cachedData = JSON.parse(newCachedData);
    }
  }

  private getLocalStorageKey(): string {
    return `${this.servers.getSelectedServerId()}_${this.row.topic}_${this.row.partition}_${this.property}`;
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
