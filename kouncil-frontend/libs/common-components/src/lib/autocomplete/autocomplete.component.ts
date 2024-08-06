import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {SelectableItem} from '../selectable-item';
import {map, Observable, startWith} from 'rxjs';
import {MatCheckboxChange} from '@angular/material/checkbox';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-common-autocomplete',
  template: `
    <mat-form-field [appearance]="'outline'" class="autocomplete-field">
      <div class="autocomplete-input-container">
        <mat-checkbox (change)="selectAll($event)">
        </mat-checkbox>
        <input matInput type="text" class="autocomplete-input"
               [placeholder]="placeholder"
               [formControl]="control"
               [matAutocomplete]="autocomplete">
      </div>
    </mat-form-field>

    <mat-autocomplete #autocomplete="matAutocomplete"
                      [displayWith]="displayFn" [panelWidth]="panelWidth" (opened)="panelOpened()"
                      (closed)="panelClosed()">
      <mat-option disabled *ngIf="(filteredData$ | async)?.length === 0">
        {{ emptyFilteredMsg }}
      </mat-option>
      <mat-option *ngFor="let item of filteredData$ | async" class="no-padding">
        <div (click)="optionClicked($event, item)">
          <mat-checkbox [checked]="item.selected" (change)="toggleSelection(item)"
                        (click)="$event.stopPropagation()">
          </mat-checkbox>
          {{ item.label }}
        </div>
      </mat-option>
    </mat-autocomplete>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./autocomplete.component.scss']
})
export class AutocompleteComponent implements OnInit {

  @Input() data: Array<SelectableItem> = [];
  @Input() control: FormControl;
  @Input() placeholder: string;
  @Input() emptyFilteredMsg: string;
  @Input() panelWidth: string | number;
  @Output() selectedValueEvent: EventEmitter<Array<string>> = new EventEmitter();

  filteredData$: Observable<Array<SelectableItem>>;
  filterString: string = '';

  constructor() {
  }

  ngOnInit(): void {
    this.filteredData$ = this.control.valueChanges.pipe(
      startWith<string>(''),
      map(value => typeof value === 'string' ? value : this.filterString),
      map((filter: string) => this.filter(filter))
    );
  }

  displayFn: () => string = (): string => this.control.getRawValue() != null
    ? this.control.getRawValue().filter(item => item.selected).map((item: SelectableItem) => item.label).join(', ')
    : '';

  filter: (filter: string) => Array<SelectableItem> = (filter: string): Array<SelectableItem> => {
    if (!this.data) {
      return [];
    }
    if (!filter) {
      return this.data;
    } else {
      filter = filter.toLowerCase();
    }
    const terms = filter.split(/\s+/);
    return this.data.filter((topic) => {
      return terms.every((term) => topic.label.toLowerCase().indexOf(term) > -1);
    });
  };

  optionClicked: (event: Event, data: SelectableItem) => void =
    (event: Event, data: SelectableItem): void => {
      event.stopPropagation();
      this.toggleSelection(data);
    };

  toggleSelection: (data: SelectableItem) => void = (data: SelectableItem): void => {
    data.selected = !data.selected;
    if (!data.selected) {
      const i = this.data.findIndex(value => value.value === data.value);
      this.data[i].selected = false;
    }
  };

  panelOpened(): void {
    this.filterString = '';
    this.control.setValue([]);
  }

  panelClosed(): void {
    this.control.setValue(this.data);
    this.selectedValueEvent.emit(this.data.filter(item => item.selected).map(item => item.value));
  }

  selectAll($event: MatCheckboxChange): void {
    this.data.forEach(
      item => {
        item.selected = $event.checked;
      }
    );
  }
}
