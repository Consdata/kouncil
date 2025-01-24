import {AfterViewInit, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ViewMode} from '@app/common-utils';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {SelectableItem} from '@app/common-components';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-policy-resources',
  template: `
    <div class="resources-section">
      <div style="padding-bottom: 32px">
        <div class="resources-section-header">Resources</div>
        <div class="add-resource-btn"
             *ngIf="viewMode !== ViewMode.VIEW && policyForm.get('applyToAllResources') && !policyForm.get('applyToAllResources').value">
          <button type="button" class="action-button-blue" mat-button [disableRipple]="true"
                  (click)="addResource()">
            <mat-icon class="material-symbols-outlined add add-button-icon">
              add
            </mat-icon>
            Add resource
          </button>
        </div>
      </div>

      <div>
        <app-common-checkbox-field [form]="policyForm" [label]="'Apply policy to all resources'"
                                   [controlName]="'applyToAllResources'"
                                   [labelPosition]="'before'"></app-common-checkbox-field>
      </div>

      <div
        *ngIf="policyForm.get('applyToAllResources') && !policyForm.get('applyToAllResources').value">
        <ng-container *ngFor="let resourceForm of resources.controls; let i = index">
          <div class="resource-fields">
            <app-common-select-field [form]="resourceForm" class="full-width"
                                     [options]="clusters"
                                     [controlName]="'cluster'"></app-common-select-field>

            <app-common-text-field class="full-width" [form]="resourceForm"
                                   [controlName]="'topic'"
                                   [placeholder]="'Regex or full topic name'"></app-common-text-field>

            <button class="action-button-white" type="button" mat-button [disableRipple]="true"
                    (click)="removeResource(i)" *ngIf="viewMode !== ViewMode.VIEW">
              <mat-icon class="material-symbols-outlined remove">
                remove
              </mat-icon>
            </button>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styleUrls: ['./policy-form-resources.component.scss']
})
export class PolicyFormResourcesComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() viewMode: ViewMode;
  @Input() policyForm: FormGroup;
  @Input() clusters: Array<SelectableItem>;
  ViewMode: typeof ViewMode = ViewMode;
  subscriptions: Subscription = new Subscription();

  constructor() {
  }

  ngOnInit(): void {
    if (this.viewMode === ViewMode.CREATE) {
      this.subscriptions.add(this.policyForm.get('applyToAllResources').valueChanges.subscribe(
        value => {
          if (value) {
            (this.policyForm.get('resources') as FormArray).clear();
            (this.policyForm.get('resources') as FormArray).setErrors(null);
          } else {
            this.addResource();
          }
        }
      ));
    }
  }

  ngAfterViewInit(): void {
    if (this.viewMode === ViewMode.CREATE) {
      this.addResource();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get resources(): FormArray<FormGroup> {
    return this.policyForm.get('resources') as FormArray<FormGroup>;
  }

  addResource(): void {
    this.resources.push(new FormGroup({
      cluster: new FormControl(),
      topic: new FormControl()
    }));
  }

  removeResource(index: number): void {
    this.resources.removeAt(index);
  }
}
