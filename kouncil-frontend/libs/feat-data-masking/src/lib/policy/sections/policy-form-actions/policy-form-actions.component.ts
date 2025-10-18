import {Component, Input, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {ViewMode} from '@app/common-utils';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'app-policy-actions',
  template: `
    <div class="actions">
      <button mat-button [disableRipple]="true" class="action-button-white"
              [routerLink]="['/data-masking-policies']">
        Cancel
      </button>

      <button *ngIf="isVisible([ViewMode.CREATE, ViewMode.EDIT])"
              mat-button [disableRipple]="true"
              class="action-button-blue" type="submit"
              [disabled]="policyForm.invalid"
      >
        Save
      </button>

      <button *ngIf="isVisible([ViewMode.VIEW])"
              mat-button [disableRipple]="true"
              [routerLink]="['/data-masking-policy/', policyId, 'edit']"
              class="action-button-blue" type="button">
        Edit
      </button>
    </div>
  `,
  styleUrls: ['./policy-form-actions.component.scss']
})
export class PolicyFormActionsComponent implements OnDestroy {

  @Input() viewMode: ViewMode;
  @Input() policyForm: FormGroup;
  @Input() policyId: number;
  ViewMode: typeof ViewMode = ViewMode;
  subscriptions: Subscription = new Subscription();

  constructor() {
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  isVisible(viewModes: ViewMode[]): boolean {
    return viewModes.includes(this.viewMode);
  }
}
