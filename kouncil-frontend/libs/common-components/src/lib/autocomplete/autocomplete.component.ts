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
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-common-autocomplete',
  template: `
    <div [formGroup]="form">
      <div class="label" *ngIf="label">
        {{ label }}
        <span *ngIf="required && !readonly" class="requiredField">*</span>
      </div>
      <mat-form-field [appearance]="'outline'" class="full-width">
        <div class="autocomplete-input-container full-width">
          <mat-checkbox (change)="selectAll($event)">
          </mat-checkbox>
          <input matInput type="text" class="autocomplete-input"
                 [placeholder]="placeholder"
                 [formControlName]="controlName"
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
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./autocomplete.component.scss']
})
export class AutocompleteComponent implements OnInit {

  @Input() data: Array<SelectableItem> = [];
  @Input() controlName: string;
  @Input() form: FormGroup;
  @Input() placeholder: string;
  @Input() label: string;
  @Input() required: boolean;
  @Input() readonly: boolean;
  @Input() emptyFilteredMsg: string;
  @Input() panelWidth: string | number;
  @Output() selectedValueEvent: EventEmitter<Array<any>> = new EventEmitter();

  filteredData$: Observable<Array<SelectableItem>>;
  filterString: string = '';

  constructor() {
  }

  ngOnInit(): void {
    this.filteredData$ = this.getControl().valueChanges.pipe(
      startWith<string>(''),
      map(value => typeof value === 'string' ? value : this.filterString),
      map((filter: string) => this.filter(filter))
    );
  }

  displayFn: () => string = (): string => this.getControl().getRawValue() != null
    ? this.getControl().getRawValue().filter(item => item.selected).map((item: SelectableItem) => item.label).join(', ')
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
    this.getControl().setValue([]);
  }

  panelClosed(): void {
    this.getControl().setValue(this.data);
    this.selectedValueEvent.emit(this.data.filter(item => item.selected).map(item => item.value));
  }

  selectAll($event: MatCheckboxChange): void {
    this.data.forEach(
      item => {
        item.selected = $event.checked;
      }
    );
  }

  getControl(): FormControl {
    return this.form.get(this.controlName) as FormControl;
  }
}
