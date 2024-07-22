import {ChangeDetectionStrategy, Component, forwardRef, Input} from '@angular/core';
import {FormGroup, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'app-common-text-field',
  template: `
    <div [formGroup]="form">
      <div class="label">
        {{ label }}
        <span *ngIf="required" class="requiredField">*</span>
      </div>
      <mat-form-field [appearance]="'outline'" class="full-width">
        <input matInput type="text" [formControlName]="controlName" [placeholder]="placeholder"
               [readonly]="readonly"/>
      </mat-form-field>

      <ng-container *ngIf="isFieldInvalid()">
        <mat-error class="error" *ngIf="hasError('required')">
          Field is required
        </mat-error>
        <mat-error class="error" *ngIf="hasError('unique')">
          Field value is not unique
        </mat-error>
      </ng-container>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./text-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextFieldComponent),
      multi: true,
    }
  ]
})
export class TextFieldComponent {

  @Input() form: FormGroup;
  @Input() controlName: string;
  @Input() label: string;
  @Input() placeholder: string;
  @Input() required: boolean = false;
  @Input() readonly: boolean = false;

  isFieldInvalid(): boolean {
    return this.form.get(this.controlName).touched && this.form.get(this.controlName).invalid;
  }

  hasError(errorCode: string): boolean {
    return this.form.get(this.controlName)?.hasError(errorCode);
  }
}
