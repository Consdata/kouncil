import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';
import {ClusterMetadata, SchemaAuthenticationMethod, StoreType} from '../../../cluster.model';
import {ClusterFormUtil} from '../../cluster-form-util';
import {SelectableItem} from '@app/common-components';
import {ViewMode} from '@app/common-utils';

@Component({
  selector: 'app-cluster-schema-registry',
  template: `
    <div class="schema-registry-section">

      <app-common-text-field [label]="'Schema registry URL'"
                             [form]="schemaRegistryForm"
                             [controlName]="'url'"></app-common-text-field>

      <app-common-radio-field [label]="'Authentication method'"
                              [form]="schemaRegistrySecurityForm"
                              [controlName]="'authenticationMethod'"
                              class="authentication-type"
                              [options]="schemaAuthMethods"></app-common-radio-field>

      <div
        *ngIf="['SSL_BASIC_AUTH', 'SSL'].includes(schemaRegistrySecurityForm.get('authenticationMethod').value)"
        class="security-section">
        <div class="half-width">
          <app-common-text-field [label]="'Keystore file location'"
                                 [form]="schemaRegistrySecurityForm"
                                 [controlName]="'keystoreLocation'">
          </app-common-text-field>
          <app-common-password-field [label]="'Keystore password'"
                                     [form]="schemaRegistrySecurityForm"
                                     [controlName]="'keystorePassword'">
          </app-common-password-field>
          <app-common-select-field [label]="'Keystore type'"
                                   [form]="schemaRegistrySecurityForm"
                                   class="full-width"
                                   [options]="certStoreType"
                                   [controlName]="'keystoreType'"></app-common-select-field>
          <app-common-password-field [label]="'Key password'"
                                     [form]="schemaRegistrySecurityForm"
                                     [controlName]="'keyPassword'">
          </app-common-password-field>
        </div>
        <div class="half-width">

          <app-common-text-field [label]="'Truststore file location'"
                                 [form]="schemaRegistrySecurityForm"
                                 [controlName]="'truststoreLocation'"
                                 [required]="viewMode !== ViewMode.VIEW">
          </app-common-text-field>
          <app-common-password-field [label]="'Truststore password'"
                                     [form]="schemaRegistrySecurityForm"
                                     [controlName]="'truststorePassword'"
                                     [required]="viewMode !== ViewMode.VIEW">
          </app-common-password-field>
          <app-common-select-field [label]="'Truststore type'"
                                   [form]="schemaRegistrySecurityForm"
                                   class="full-width" [required]="viewMode !== ViewMode.VIEW"
                                   [options]="certStoreType"
                                   [controlName]="'truststoreType'"></app-common-select-field>
        </div>

        <div class="half-width"
             *ngIf="schemaRegistrySecurityForm.get('authenticationMethod').value === 'SSL_BASIC_AUTH'">
          <app-common-text-field [label]="'Username'" [form]="schemaRegistrySecurityForm"
                                 class="full-width" [required]="viewMode !== ViewMode.VIEW"
                                 [controlName]="'username'"></app-common-text-field>
          <app-common-password-field [label]="'Password'" [form]="schemaRegistrySecurityForm"
                                     class="full-width" [required]="viewMode !== ViewMode.VIEW"
                                     [controlName]="'password'"></app-common-password-field>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./cluster-form-schema-registry.component.scss']
})
export class ClusterFormSchemaRegistryComponent implements OnInit, OnDestroy {

  @Input() model: ClusterMetadata = {} as ClusterMetadata;
  @Input() clusterForm: FormGroup;
  @Input() viewMode: ViewMode;
  ViewMode: typeof ViewMode = ViewMode;

  subscriptions: Subscription = new Subscription();

  schemaAuthMethods: Array<SelectableItem> = Object.keys(SchemaAuthenticationMethod)
  .map(method => new SelectableItem(SchemaAuthenticationMethod[method], method, false));

  certStoreType: Array<SelectableItem> = Object.keys(StoreType)
  .map(type => new SelectableItem(StoreType[type], type, false));

  constructor() {
  }

  ngOnInit(): void {
    if (ViewMode.VIEW !== this.viewMode) {
      this.subscriptions.add(this.schemaRegistrySecurityForm.get('authenticationMethod').valueChanges.subscribe(value => {
        switch (value) {
          case 'NONE':
            Object.keys(this.schemaRegistrySecurityForm.controls)
            .filter(securityControlName => securityControlName !== 'authenticationMethod')
            .forEach(securityControlName => {
              ClusterFormUtil.removeFieldRequirement(securityControlName, this.schemaRegistrySecurityForm);
            });
            break;
          case 'SSL_BASIC_AUTH':
            ['username', 'password', 'truststoreLocation', 'truststorePassword', 'truststoreType']
            .forEach(securityControlName => {
              ClusterFormUtil.addFieldRequirement(securityControlName, this.schemaRegistrySecurityForm);
            });
            break;
          case 'SSL':
            ['truststoreLocation', 'truststorePassword', 'truststoreType']
            .forEach(securityControlName => {
              ClusterFormUtil.addFieldRequirement(securityControlName, this.schemaRegistrySecurityForm);
            });

            ['username', 'password'].forEach(securityControlName => {
              ClusterFormUtil.removeFieldRequirement(securityControlName, this.schemaRegistrySecurityForm);
            });
            break;
        }
      }));
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get schemaRegistryForm(): FormGroup {
    return this.clusterForm.get('schemaRegistry') as FormGroup;
  }

  get schemaRegistrySecurityForm(): FormGroup {
    return this.schemaRegistryForm.get('schemaRegistrySecurityConfig') as FormGroup;
  }
}
