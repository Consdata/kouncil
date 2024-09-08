import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {SelectableItem} from '../selectable-item';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'app-common-radio-field',
  template: `
    <div [formGroup]="form">
      <div class="label">
        {{ label }}
        <span *ngIf="required" class="requiredField">*</span>
      </div>
      <mat-radio-group aria-label="Select an option" [formControlName]="controlName"
                       class="radio-group">
        <mat-radio-button *ngFor="let option of options" [value]="option.value"
                          class="full-width common-radio-button">
          {{ option.label }}
        </mat-radio-button>
      </mat-radio-group>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./radio-field.component.scss']
})
export class RadioFieldComponent {
  @Input() form: FormGroup;
  @Input() controlName: string;
  @Input() label: string;
  @Input() required: boolean = false;
  @Input() options: Array<SelectableItem> = [];
}
