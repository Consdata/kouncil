import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {SelectableItem} from "./selectable-item";
import {map, Observable, startWith} from "rxjs";

@Component({
  selector: 'app-common-autocomplete',
  template: `
    <mat-form-field [appearance]="'outline'">
      <input matInput type="text"
             [placeholder]="placeholder"
             [formControl]="control"
             [matAutocomplete]="autocomplete">
    </mat-form-field>

    <mat-autocomplete #autocomplete="matAutocomplete"
                      [displayWith]="displayFn" [panelWidth]="panelWidth" (opened)="panelOpened()"
                      (closed)="panelClosed()">
      <mat-option disabled *ngIf="(filteredData | async)?.length === 0">
        {{emptyFilteredMsg}}
      </mat-option>
      <mat-option *ngFor="let item of filteredData | async" class="no-padding">
        <div (click)="optionClicked($event, item)">
          <mat-checkbox [checked]="item.selected" (change)="toggleSelection(item)"
                        (click)="$event.stopPropagation()">
          </mat-checkbox>
          {{item.label}}
        </div>
      </mat-option>
    </mat-autocomplete>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./autocomplete.component.scss']
})
export class AutocompleteComponent implements OnInit {

  @Input() data: Array<SelectableItem> = [];
  @Input() control;
  @Input() placeholder: string
  @Input() emptyFilteredMsg: string
  @Input() panelWidth: number

  selectedData: Array<SelectableItem> = [];
  filteredData: Observable<Array<SelectableItem>>;
  filterString: string = '';

  constructor() {
  }

  ngOnInit() {
    this.filteredData = this.control.valueChanges.pipe(
      startWith<string>(''),
      map(value => typeof value === 'string' ? value : this.filterString),
      map((filter: string) => this.filter(filter))
    );
  }

  displayFn = (): string => this.control.getRawValue() != null ? this.control.getRawValue().map((item: SelectableItem) => item.label).join(', ') : '';

  filter = (filter: string): Array<SelectableItem> => {
    this.filterString = filter;
    if (filter.length > 0) {
      return this.data.filter(option => {
        return option.value.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
      });
    } else {
      return this.data.slice();
    }
  };

  optionClicked = (event: Event, data: SelectableItem): void => {
    event.stopPropagation();
    this.toggleSelection(data);
  };

  toggleSelection = (data: SelectableItem): void => {
    data.selected = !data.selected;
    if (data.selected) {
      this.selectedData.push(data);
    } else {
      const i = this.selectedData.findIndex(value => value.value === data.value);
      this.selectedData.splice(i, 1);
    }
    this.control.setValue(this.selectedData);
  };

  panelOpened() {
    this.filterString = '';
    this.control.setValue([]);
  }

  panelClosed() {
    this.control.setValue(this.selectedData);
  }
}
