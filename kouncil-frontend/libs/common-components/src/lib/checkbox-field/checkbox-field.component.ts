import {ChangeDetectionStrategy, Component, forwardRef, Input} from '@angular/core';
import {FormGroup, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'app-common-checkbox-field',
  template: `
    <div [formGroup]="form">
      <mat-checkbox [formControlName]="controlName" [labelPosition]="labelPosition">
        <span class="label">{{ label }}</span>
        <span *ngIf="required && !readonly" class="requiredField">*</span>
      </mat-checkbox>

      <ng-container *ngIf="isFieldInvalid()">
        <mat-error class="error" *ngIf="hasError('required')">
          Field is required
        </mat-error>
      </ng-container>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./checkbox-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxFieldComponent),
      multi: true,
    }
  ]
})
export class CheckboxFieldComponent {

  @Input() form: FormGroup;
  @Input() controlName: string;
  @Input() label: string;
  @Input() labelPosition: 'before' | 'after';
  @Input() required: boolean = false;
  @Input() readonly: boolean = false;

  isFieldInvalid(): boolean {
    return this.form.get(this.controlName).touched && this.form.get(this.controlName).invalid;
  }

  hasError(errorCode: string): boolean {
    return this.form.get(this.controlName)?.hasError(errorCode);
  }
}
