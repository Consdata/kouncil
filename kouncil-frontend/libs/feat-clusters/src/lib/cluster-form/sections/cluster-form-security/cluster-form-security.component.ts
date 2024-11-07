import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';
import {
  ClusterAuthenticationMethod,
  ClusterMetadata,
  ClusterSASLMechanism,
  ClusterSecurityProtocol
} from '../../../cluster.model';
import {SelectableItem} from '@app/common-components';
import {ClusterFormUtil} from '../../cluster-form-util';
import {ViewMode} from '@app/common-utils';

@Component({
  selector: 'app-cluster-security',
  template: `
    <app-common-radio-field [label]="'Authentication method'" [form]="clusterSecurityForm"
                            [controlName]="'authenticationMethod'"
                            class="authentication-type"
                            [options]="authMethods"></app-common-radio-field>

    <!--SASL Authentication-->
    <div
      *ngIf="clusterSecurityForm.get('authenticationMethod').value === 'SASL'"
      class="security-section">

      <div class="half-width">
        <app-common-select-field [label]="'Security protocol'" [form]="clusterSecurityForm"
                                 class="full-width" [required]="viewMode !== ViewMode.VIEW"
                                 [options]="securityProtocolOptions"
                                 [controlName]="'securityProtocol'"></app-common-select-field>
        <app-common-select-field [label]="'SASL Mechanism'" [form]="clusterSecurityForm"
                                 class="full-width" [required]="viewMode !== ViewMode.VIEW"
                                 [options]="saslMechanismOptions"
                                 [controlName]="'saslMechanism'"></app-common-select-field>
      </div>

      <div class="half-width">
        <app-common-text-field [label]="'Username'" [form]="clusterSecurityForm"
                               class="full-width" [required]="viewMode !== ViewMode.VIEW"
                               [controlName]="'username'"></app-common-text-field>
        <app-common-password-field [label]="'Password'" [form]="clusterSecurityForm"
                                   class="full-width" [required]="viewMode !== ViewMode.VIEW"
                                   [controlName]="'password'"></app-common-password-field>
      </div>
    </div>

    <!--SSL Authentication-->
    <div
      *ngIf="clusterSecurityForm.get('authenticationMethod').value === 'SSL'"
      class="security-section">
      <div class="half-width">
        <app-common-text-field [label]="'Keystore file location'"
                               [form]="clusterSecurityForm"
                               [controlName]="'keystoreLocation'"
                               [required]="viewMode !== ViewMode.VIEW">
        </app-common-text-field>
        <app-common-password-field [label]="'Keystore password'"
                                   [form]="clusterSecurityForm"
                                   [controlName]="'keystorePassword'"
                                   [required]="viewMode !== ViewMode.VIEW">
        </app-common-password-field>
        <app-common-password-field [label]="'Key password'" [form]="clusterSecurityForm"
                                   [controlName]="'keyPassword'"
                                   [required]="viewMode !== ViewMode.VIEW">
        </app-common-password-field>
      </div>
      <div class="half-width">

        <app-common-text-field [label]="'Truststore file location'"
                               [form]="clusterSecurityForm"
                               [controlName]="'truststoreLocation'"
                               [required]="viewMode !== ViewMode.VIEW">
        </app-common-text-field>
        <app-common-password-field [label]="'Truststore password'"
                                   [form]="clusterSecurityForm"
                                   [controlName]="'truststorePassword'"
                                   [required]="viewMode !== ViewMode.VIEW">
        </app-common-password-field>
      </div>
    </div>

    <!--AWS MSK Authentication-->
    <div
      *ngIf="clusterSecurityForm.get('authenticationMethod').value === 'AWS_MSK'"
      class="security-section">
      <app-common-text-field [label]="' AWS Profile name'" [form]="clusterSecurityForm"
                             class="half-width" [required]="viewMode !== ViewMode.VIEW"
                             [controlName]="'awsProfileName'">
      </app-common-text-field>
    </div>
  `,
  styleUrls: ['./cluster-form-security.component.scss']
})
export class ClusterFormSecurityComponent implements OnInit, OnDestroy {

  @Input() model: ClusterMetadata = {} as ClusterMetadata;
  @Input() clusterForm: FormGroup;
  @Input() viewMode: ViewMode;
  ViewMode: typeof ViewMode = ViewMode;

  @Output() updateTestConnectionState: EventEmitter<'default' | 'connecting' | 'connected' | 'failed'> =
    new EventEmitter<'default' | 'connecting' | 'connected' | 'failed'>();

  subscriptions: Subscription = new Subscription();

  securityProtocolOptions: Array<SelectableItem> = Object.keys(ClusterSecurityProtocol)
  .map(protocol => new SelectableItem(ClusterSecurityProtocol[protocol], protocol, false));

  saslMechanismOptions: Array<SelectableItem> = Object.keys(ClusterSASLMechanism)
  .map(mechanism => new SelectableItem(ClusterSASLMechanism[mechanism], mechanism, false));

  authMethods: Array<SelectableItem> = Object.keys(ClusterAuthenticationMethod)
  .map(method => new SelectableItem(ClusterAuthenticationMethod[method], method, false));

  constructor() {
  }

  ngOnInit(): void {
    if (ViewMode.VIEW !== this.viewMode) {
      this.subscriptions.add(this.clusterSecurityForm.get('authenticationMethod').valueChanges.subscribe(value => {
        this.updateTestConnectionState.emit('default');

        switch (value) {
          case 'NONE':
            Object.keys(this.clusterSecurityForm.controls)
            .filter(securityControlName => securityControlName !== 'authenticationMethod')
            .forEach(securityControlName => {
              ClusterFormUtil.removeFieldRequirement(securityControlName, this.clusterSecurityForm);
            });
            break;
          case 'SASL':
            ['securityProtocol', 'saslMechanism', 'username', 'password'].forEach(securityControlName => {
              ClusterFormUtil.addFieldRequirement(securityControlName, this.clusterSecurityForm);
            });

            ['keystoreLocation', 'keystorePassword', 'keyPassword', 'truststoreLocation', 'truststorePassword', 'awsProfileName']
            .forEach(securityControlName => {
              ClusterFormUtil.removeFieldRequirement(securityControlName, this.clusterSecurityForm);
            });
            break;
          case 'SSL':
            ['keystoreLocation', 'keystorePassword', 'keyPassword', 'truststoreLocation', 'truststorePassword'].forEach(securityControlName => {
              ClusterFormUtil.addFieldRequirement(securityControlName, this.clusterSecurityForm);
            });

            ['securityProtocol', 'saslMechanism', 'username', 'password', 'awsProfileName'].forEach(securityControlName => {
              ClusterFormUtil.removeFieldRequirement(securityControlName, this.clusterSecurityForm);
            });
            break;
          case 'AWS_MSK':
            ['awsProfileName'].forEach(securityControlName => {
              ClusterFormUtil.addFieldRequirement(securityControlName, this.clusterSecurityForm);
            });

            ['securityProtocol', 'saslMechanism', 'username', 'password', 'keystoreLocation', 'keystorePassword',
              'keyPassword', 'truststoreLocation', 'truststorePassword']
            .forEach(securityControlName => {
              ClusterFormUtil.removeFieldRequirement(securityControlName, this.clusterSecurityForm);
            });
            break;
        }
      }));
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get clusterSecurityForm(): FormGroup {
    return this.clusterForm.get('clusterSecurityConfig') as FormGroup;
  }
}
