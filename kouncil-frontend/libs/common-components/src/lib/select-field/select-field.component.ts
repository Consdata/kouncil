import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {SelectableItem} from '../selectable-item';
import {AbstractControl, FormGroup} from '@angular/forms';
import {MatSelectChange} from '@angular/material/select';

@Component({
  selector: 'app-common-select-field',
  template: `
    <div [formGroup]="form">
      <div class="label">
        {{ label }}
        <span *ngIf="required" class="requiredField">*</span>
      </div>
      <mat-form-field [appearance]="'outline'" class="full-width">
        <mat-select [formControlName]="controlName" placeholder="{{placeholder}}"
                    (selectionChange)="selectionChangeEvent.emit($event)">
          <mat-option *ngFor="let option of options" [value]="option.value">
            {{ option.label }}
          </mat-option>
        </mat-select>

        <button *ngIf="clearValueBtn && getControl().value && !readonly"
                mat-icon-button matSuffix type="button" class="clear-btn"
                (click)="$event.stopPropagation(); getControl().patchValue(null)">
          <mat-icon class="material-symbols-outlined clear-icon">close</mat-icon>
        </button>

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
  @Input() placeholder: string;
  @Input() required: boolean = false;
  @Input() readonly: boolean = false;
  @Input() clearValueBtn: boolean = false;
  @Input() options: Array<SelectableItem> = [];
  @Output() selectionChangeEvent: EventEmitter<MatSelectChange> = new EventEmitter<MatSelectChange>();

  isFieldInvalid(): boolean {
    return this.form.get(this.controlName).touched && this.form.get(this.controlName).invalid;
  }

  hasError(errorCode: string): boolean {
    return this.form.get(this.controlName)?.hasError(errorCode);
  }

  getControl(): AbstractControl {
    return this.form.get(this.controlName);
  }
}
