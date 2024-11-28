import {AfterViewInit, Component, Input} from '@angular/core';
import {ViewMode} from '@app/common-utils';
import {MaskingType} from '../../../policy.model';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {SelectableItem} from '@app/common-components';

@Component({
  selector: 'app-policy-fields',
  template: `
    <div class="fields-section">
      <div>
        <div class="fields-section-header">Fields</div>
        <div class="add-field-btn" *ngIf="viewMode !== ViewMode.VIEW">
          <button type="button" class="action-button-blue" mat-button [disableRipple]="true"
                  (click)="addField()">
            <mat-icon class="material-symbols-outlined add add-button-icon">
              add
            </mat-icon>
            Add field
          </button>
        </div>
      </div>

      <ng-container *ngFor="let fieldForm of fields.controls; let i = index">
        <div class="field-section">
          <app-common-text-field class="full-width" [form]="fieldForm"
                                 [controlName]="'field'"
                                 [placeholder]="'Regex or full field name. Use dot (.) as field separator if need path to access your field.'">
          </app-common-text-field>

          <app-common-select-field [form]="fieldForm"
                                   [placeholder]="'Masking type'"
                                   class="full-width" [options]="maskingTypeOptions"
                                   [controlName]="'maskingType'"></app-common-select-field>

          <button class="action-button-white" type="button" mat-button [disableRipple]="true"
                  (click)="removeField(i)" *ngIf="viewMode !== ViewMode.VIEW">
            <mat-icon class="material-symbols-outlined remove">
              remove
            </mat-icon>
          </button>
        </div>
      </ng-container>

    </div>
  `,
  styleUrls: ['./policy-form-fields.component.scss']
})
export class PolicyFormFieldsComponent implements AfterViewInit{

  @Input() viewMode: ViewMode;
  @Input() policyForm: FormGroup;
  ViewMode: typeof ViewMode = ViewMode;

  maskingTypeOptions: Array<SelectableItem> = Object.keys(MaskingType)
  .map(maskingType => new SelectableItem(MaskingType[maskingType], maskingType, false));

  constructor() {
  }

  ngAfterViewInit(): void {
    if (this.viewMode === ViewMode.CREATE) {
      this.addField();
    }
  }

  get fields(): FormArray<FormGroup> {
    return this.policyForm.get('fields') as FormArray<FormGroup>;
  }

  addField(): void {
    this.fields.push(new FormGroup({
      field: new FormControl(),
      maskingType: new FormControl()
    }));
  }

  removeField(index: number): void {
    this.fields.removeAt(index);
  }
}
