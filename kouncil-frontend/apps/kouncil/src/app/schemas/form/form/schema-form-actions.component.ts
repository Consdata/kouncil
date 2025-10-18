import {ChangeDetectorRef, Component, Input} from '@angular/core';
import {ViewMode} from '@app/common-utils';
import {Schema, SchemaRegistryService} from '@app/schema-registry';
import {FormGroup} from '@angular/forms';
import {ServersService} from '@app/common-servers';

@Component({
  selector: 'app-schema-form-actions',
  template: `
    <div class="actions">
      <button mat-button [disableRipple]="true" class="action-button-white test-compatibility-button"
              type="button" (click)="testCompatibility()"
              *ngIf="isVisible([ViewMode.EDIT])"
              [disabled]="schemaForm.invalid"
              [ngClass]="{
        valid: testCompatibilityState === 'valid',
        invalid: testCompatibilityState === 'invalid'
        }">
        <div class="test-compatibility-btn-content">
          <ng-container *ngIf="testCompatibilityState === 'default'">
            <mat-icon class="material-symbols-outlined sync test-compatibility-icon">
              sync
            </mat-icon>
            Check compatibility
          </ng-container>

          <ng-container *ngIf="testCompatibilityState === 'checking'">
            <mat-spinner class="small-spinner"></mat-spinner>
            Checking...
          </ng-container>

          <ng-container *ngIf="testCompatibilityState === 'valid'">
            <mat-icon class="material-symbols-outlined check_circle test-compatibility-icon">
              check_circle
            </mat-icon>
            Schema is compatible
          </ng-container>

          <ng-container *ngIf="testCompatibilityState === 'invalid'">
            <mat-icon class="material-symbols-outlined cancel test-compatibility-icon">
              cancel
            </mat-icon>
            Schema is not compatible
          </ng-container>
        </div>
      </button>

      <button mat-button [disableRipple]="true" class="action-button-white"
              [routerLink]="['/schemas']">
        Cancel
      </button>
      <button mat-button [disableRipple]="true" class="action-button-blue"
              *ngIf="isVisible([ViewMode.VIEW]) && model"
              [routerLink]="['/schemas/edit/', model.subjectName, model.version]">
        Edit
      </button>
      <button mat-button [disableRipple]="true"
              *ngIf="isVisible([ViewMode.CREATE, ViewMode.EDIT])"
              class="action-button-blue" type="submit"
              [disabled]="!schemaForm.valid">
        Save
      </button>
    </div>
  `,
  styleUrls: ['./schema-form-actions.component.scss']
})
export class SchemaFormActionsComponent {

  @Input() schemaForm: FormGroup;
  @Input() viewMode: ViewMode;
  @Input() model: Schema;

  ViewMode: typeof ViewMode = ViewMode;
  testCompatibilityState: 'default' | 'checking' | 'valid' | 'invalid' = 'default';

  constructor(private schemaRegistry: SchemaRegistryService,
              private servers: ServersService,
              private cdr: ChangeDetectorRef) {
  }

  testCompatibility(): void {
    this.testCompatibilityState = 'checking';
    this.schemaRegistry.testCompatibility$(Object.assign({}, this.schemaForm.getRawValue()), this.servers.selectedServerId)
    .subscribe(result => {
      if (result) {
        this.updateTestCompatibilityBtnState('valid');
      } else {
        this.updateTestCompatibilityBtnState('invalid');
      }

      setTimeout(() => {
        this.updateTestCompatibilityBtnState('default');
      }, 5000);
    });
  }

  updateTestCompatibilityBtnState($event: 'default' | 'checking' | 'valid' | 'invalid'): void {
    this.testCompatibilityState = $event;
    this.cdr.detectChanges();
  }

  isVisible(viewModes: ViewMode[]): boolean {
    return viewModes.includes(this.viewMode);
  }
}
