import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'app-common-password-field',
  template: `
    <div [formGroup]="form">
      <div class="label">
        {{ label }}
        <span *ngIf="required" class="requiredField">*</span>
      </div>
      <mat-form-field [appearance]="'outline'" class="full-width">
        <input matInput type="password" [formControlName]="controlName" [readonly]="readonly"
               autocomplete="new-password"/>
      </mat-form-field>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./password-field.component.scss']
})
export class PasswordFieldComponent {
  @Input() form: FormGroup;
  @Input() controlName: string;
  @Input() label: string;
  @Input() required: boolean = false;
  @Input() readonly: boolean = false;

}
