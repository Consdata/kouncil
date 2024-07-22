import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {SelectableItem} from '../selectable-item';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'app-common-select-field',
  template: `
    <div [formGroup]="form">
      <div class="label">
        {{ label }}
        <span *ngIf="required" class="requiredField">*</span>
      </div>
      <mat-form-field [appearance]="'outline'" class="full-width">
        <mat-select [formControlName]="controlName">
          <mat-option *ngFor="let option of options" [value]="option.value">
            {{ option.label }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <ng-container *ngIf="isFieldInvalid()">
        <mat-error class="error" *ngIf="hasError('required')">
          Field is required
        </mat-error>
      </ng-container>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./select-field.component.scss']
})
export class SelectFieldComponent {

  @Input() form: FormGroup;
  @Input() controlName: string;
  @Input() label: string;
  @Input() required: boolean = false;
  @Input() options: Array<SelectableItem> = [];

  isFieldInvalid(): boolean {
    return this.form.get(this.controlName).touched && this.form.get(this.controlName).invalid;
  }

  hasError(errorCode: string): boolean {
    return this.form.get(this.controlName)?.hasError(errorCode);
  }
}
