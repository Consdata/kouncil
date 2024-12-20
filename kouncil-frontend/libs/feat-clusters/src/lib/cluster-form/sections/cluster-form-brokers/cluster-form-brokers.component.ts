import {Component, Input} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {ClusterBroker, ClusterMetadata} from '../../../cluster.model';
import {ViewMode} from '@app/common-utils';
import {ClusterFormUtil} from '../../cluster-form-util';

@Component({
  selector: 'app-cluster-brokers',
  template: `
    <div class="brokers-section">
      <div>
        <div class="brokers-section-header">Brokers</div>
        <div class="add-broker-btn" *ngIf="viewMode !== ViewMode.VIEW">
          <button type="button" class="action-button-blue" mat-button [disableRipple]="true"
                  (click)="addBroker()">
            <mat-icon class="material-symbols-outlined add add-button-icon">
              add
            </mat-icon>
            Add broker
          </button>
        </div>
      </div>

      <ng-container *ngFor="let brokerForm of brokers.controls; let i = index">
        <div class="brokers-fields">
          <app-common-text-field [label]="displayLabelIfFirstRow(i, 'Bootstrap server')"
                                 class="full-width"
                                 [form]="brokerForm"
                                 [required]="i===0 && viewMode !== ViewMode.VIEW"
                                 [placeholder]="'Broker bootstrap url and port'"
                                 [controlName]="'bootstrapServer'"></app-common-text-field>

          <app-common-text-field [label]="displayLabelIfFirstRow(i, 'JMX port')"
                                 class="full-width"
                                 [form]="brokerForm"
                                 [controlName]="'jmxPort'"></app-common-text-field>

          <app-common-text-field [label]="displayLabelIfFirstRow(i, 'JMX user')"
                                 class="full-width"
                                 [form]="brokerForm"
                                 [controlName]="'jmxUser'"></app-common-text-field>

          <app-common-password-field [label]="displayLabelIfFirstRow(i, 'JMX password')"
                                     class="full-width"
                                     [form]="brokerForm"
                                     [controlName]="'jmxPassword'"></app-common-password-field>

          <div class="broker-remove-btn">
            <button class="action-button-white" type="button" mat-button [disableRipple]="true"
                    (click)="removeBroker(i)" *ngIf="viewMode !== ViewMode.VIEW">
              <mat-icon class="material-symbols-outlined remove">
                remove
              </mat-icon>
            </button>
          </div>
        </div>
      </ng-container>

    </div>
  `,
  styleUrls: ['./cluster-form-brokers.component.scss']
})
export class ClusterFormBrokersComponent {

  @Input() model: ClusterMetadata = {} as ClusterMetadata;
  @Input() clusterForm: FormGroup;
  @Input() viewMode: ViewMode;

  ViewMode: typeof ViewMode = ViewMode;

  constructor() {
  }

  addBroker(broker?: ClusterBroker): void {
    this.brokers.push(new FormGroup({
      id: new FormControl(broker ? broker.id : ''),
      bootstrapServer: new FormControl(broker ? broker.bootstrapServer : '', [Validators.required, this.checkHostPortValueCorrect()]),
      jmxUser: new FormControl(broker ? broker.jmxUser : '', {
        validators: [ClusterFormUtil.noWhitespaces()]
      }),
      jmxPassword: new FormControl(broker ? broker.jmxPassword : ''),
      jmxPort: new FormControl(broker ? broker.jmxPort : '', {
        validators: [ClusterFormUtil.noWhitespaces()]
      })
    }));
  }

  removeBroker(index: number): void {
    this.brokers.removeAt(index);
  }

  displayLabelIfFirstRow(index: number, label: string): string {
    return index === 0 ? label : '';
  }

  get brokers(): FormArray<FormGroup> {
    return this.clusterForm.get('brokers') as FormArray<FormGroup>;
  }

  private checkHostPortValueCorrect(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const regExp: RegExp = /.*:[0-9]+/;
      return control.value && !regExp.test(control.value) ? {incorrectValue: true} : null;
    };
  }
}
