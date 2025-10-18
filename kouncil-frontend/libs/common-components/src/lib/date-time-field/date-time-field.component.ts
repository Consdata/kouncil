import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'app-common-date-time-field',
  template: `
    <div [formGroup]="form">
      <div class="label">
        {{ label }}
        <span *ngIf="required && !readonly" class="requiredField">*</span>
      </div>
      <div class="date-time-field">
        <mat-form-field [appearance]="'outline'" class="half-width">
          <input matInput type="date" [formControlName]="dateControlName" [readonly]="readonly">
        </mat-form-field>
        <mat-form-field [appearance]="'outline'" class="half-width">
          <input matInput type="time" step="1" [formControlName]="timeControlName"
                 [readonly]="readonly">
        </mat-form-field>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./date-time-field.component.scss']
})
export class DateTimeFieldComponent {

  @Input() form: FormGroup;
  @Input() dateControlName: string;
  @Input() timeControlName: string;
  @Input() label: string;
  @Input() placeholder: string;
  @Input() required: boolean = false;
  @Input() readonly: boolean = false;
}
