import {Component, Input, OnInit} from '@angular/core';
import {ConsumerGroupOffset} from "../consumer-group/consumer-group";
import {ServersService} from "../../servers.service";

@Component({
  selector: 'cached-cell',
  templateUrl: './cached-cell.component.html',
  styleUrls: ['./cached-cell.component.scss']
})
export class CachedCellComponent implements OnInit {

  @Input()
  public property: string;

  private cachedValue: string;

  private _row: ConsumerGroupOffset;

  @Input()
  public set row(newRow: ConsumerGroupOffset) {
    if (this.shouldBeCached(newRow)) {
      this.cacheValue();
    }

    this._row = newRow;

    if (!this.cachedValue) {
      this.readCachedValue();
    }
  };

  public get row(): ConsumerGroupOffset {
    return this._row;
  }

  constructor(private servers: ServersService) { }

  public ngOnInit(): void { }

  private readCachedValue(): void {
    const newCachedValue: string = localStorage.getItem(this.getLocalStorageKey());
    if (newCachedValue) {
      this.cachedValue = newCachedValue;
    }
  }

  private shouldBeCached(newRow: ConsumerGroupOffset): boolean {
    return this.row && this.row[this.property] && !newRow[this.property];
  }

  private cacheValue(): void {
    this.cachedValue = this.row[this.property];
    localStorage.setItem(this.getLocalStorageKey(), this.cachedValue);
  }

  private getLocalStorageKey(): string {
    return `${this.servers.getSelectedServerId()}_${this.row.topic}_${this.row.partition}_${this.property}`;
  }

  public getValue(): string {
    return this._row[this.property]
      ? this._row[this.property]
      : this.cachedValue ?? '';
  }
}
