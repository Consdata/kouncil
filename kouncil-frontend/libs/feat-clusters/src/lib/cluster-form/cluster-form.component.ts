import {AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import {ClusterService} from './cluster.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ClusterMetadata} from '../cluster.model';
import {ServersService} from '@app/common-servers';
import {map, Observable, Subscription} from 'rxjs';
import {
  ClusterFormBrokersComponent
} from './sections/cluster-form-brokers/cluster-form-brokers.component';
import {
  ClusterFormActionsComponent
} from './sections/cluster-form-actions/cluster-form-actions.component';
import {SnackBarComponent, SnackBarData, SnackBarType, ViewMode} from '@app/common-utils';
import {ClusterFormUtil} from './cluster-form-util';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-cluster',
  template: `
    <form class="cluster-form" [formGroup]="clusterForm" (ngSubmit)="saveCluster()"
          autocomplete="off">
      <div class="cluster-form-header">
        <div class="cluster-form-title">
          {{ getHeaderMessage() }}
        </div>
      </div>

      <mat-accordion class="panels-container">
        <mat-expansion-panel [expanded]="true">
          <mat-expansion-panel-header>
            <mat-panel-title class="panel-header"> Cluster and broker data</mat-panel-title>
          </mat-expansion-panel-header>

          <app-common-text-field [label]="'Cluster name'" [required]="ViewMode.VIEW !== viewMode"
                                 [placeholder]="'Unique cluster name'"
                                 [form]="clusterForm" [readonly]="ViewMode.CREATE !== viewMode"
                                 [controlName]="'name'"></app-common-text-field>

          <div class="jmx-section">
            <app-common-text-field [label]="'Global JMX port'"
                                   class="full-width"
                                   [form]="clusterForm"
                                   [controlName]="'globalJmxPort'"></app-common-text-field>

            <app-common-text-field [label]="'Global JMX user'"
                                   class="full-width"
                                   [form]="clusterForm"
                                   [controlName]="'globalJmxUser'"></app-common-text-field>

            <app-common-password-field [label]="'Global JMX password'"
                                       class="full-width"
                                       [form]="clusterForm"
                                       [controlName]="'globalJmxPassword'"></app-common-password-field>
          </div>

          <app-cluster-brokers [clusterForm]="clusterForm" [model]="model"
                               [viewMode]="viewMode"></app-cluster-brokers>
        </mat-expansion-panel>

        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title class="panel-header"> Cluster security</mat-panel-title>
          </mat-expansion-panel-header>
          <app-cluster-security [clusterForm]="clusterForm" [model]="model"
                                (updateTestConnectionState)="updateTestConnectionBtnState($event)"
                                [viewMode]="viewMode"></app-cluster-security>
        </mat-expansion-panel>

        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title class="panel-header"> Schema registry</mat-panel-title>
          </mat-expansion-panel-header>
          <app-cluster-schema-registry [clusterForm]="clusterForm" [model]="model"
                                       [viewMode]="viewMode"></app-cluster-schema-registry>
        </mat-expansion-panel>
      </mat-accordion>

      <app-cluster-actions [clusterForm]="clusterForm" [viewMode]="viewMode"
                           [clusterName]="model.name"></app-cluster-actions>
    </form>
  `,
  styleUrls: ['./cluster-form.component.scss']
})
export class ClusterFormComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() viewMode: ViewMode;

  model: ClusterMetadata = {} as ClusterMetadata;
  subscriptions: Subscription = new Subscription();
  ViewMode: typeof ViewMode = ViewMode;

  clusterForm: FormGroup = new FormGroup({
    id: new FormControl(),
    name: new FormControl('', {
      validators: [Validators.required, ClusterFormUtil.noWhitespaces()],
      asyncValidators: this.nameShouldBeUnique(),
      updateOn: 'change'
    }),
    clusterSecurityConfig: new FormGroup({
      authenticationMethod: new FormControl('NONE'),
      securityProtocol: new FormControl(),
      saslMechanism: new FormControl(),
      keystoreLocation: new FormControl('', {
        validators: [ClusterFormUtil.noWhitespaces()]
      }),
      keystorePassword: new FormControl(),
      keyPassword: new FormControl(),
      truststoreLocation: new FormControl('', {
        validators: [ClusterFormUtil.noWhitespaces()]
      }),
      truststorePassword: new FormControl(),
      awsProfileName: new FormControl('', {
        validators: [ClusterFormUtil.noWhitespaces()]
      }),
      username: new FormControl('', {
        validators: [ClusterFormUtil.noWhitespaces()]
      }),
      password: new FormControl(),
    }),
    brokers: new FormArray([], [Validators.required]),
    globalJmxUser: new FormControl('', {
      validators: [ClusterFormUtil.noWhitespaces()]
    }),
    globalJmxPort: new FormControl('', {
      validators: [ClusterFormUtil.noWhitespaces()]
    }),
    globalJmxPassword: new FormControl(),
    schemaRegistry: new FormGroup({
      id: new FormControl(),
      url: new FormControl('', {
        validators: [ClusterFormUtil.noWhitespaces()]
      }),
      schemaRegistrySecurityConfig: new FormGroup({
        authenticationMethod: new FormControl('NONE'),
        keystoreLocation: new FormControl('', {
          validators: [ClusterFormUtil.noWhitespaces()]
        }),
        keystorePassword: new FormControl(),
        keystoreType: new FormControl(),
        keyPassword: new FormControl(),
        truststoreLocation: new FormControl('', {
          validators: [ClusterFormUtil.noWhitespaces()]
        }),
        truststorePassword: new FormControl(),
        truststoreType: new FormControl(),
        username: new FormControl('', {
          validators: [ClusterFormUtil.noWhitespaces()]
        }),
        password: new FormControl(),
      }),
    })
  });

  @ViewChild(ClusterFormBrokersComponent) brokers: ClusterFormBrokersComponent;
  @ViewChild(ClusterFormActionsComponent) actions: ClusterFormActionsComponent;

  constructor(private clusterService: ClusterService,
              private route: ActivatedRoute,
              private router: Router,
              private servers: ServersService,
              private snackbar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.subscriptions.add(this.route.params.subscribe((params) => {
      const clusterName = params['clusterName'];
      if (clusterName) {
        this.getClusterByName(clusterName);
      }
    }));
  }

  ngAfterViewInit(): void {
    if (this.viewMode === ViewMode.CREATE) {
      this.brokers.addBroker();
    }

    this.defineDisabled(this.clusterForm);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private defineDisabled(form: FormGroup | FormArray) {
    if (ViewMode.VIEW === this.viewMode) {
      Object.keys(form.controls).forEach(key => {
        if (form.get(key) instanceof FormGroup || form.get(key) instanceof FormArray) {
          this.defineDisabled((form.get(key) as FormArray | FormGroup));
        }
        form.get(key).disable();
      });
    } else if (ViewMode.EDIT === this.viewMode) {
      this.clusterForm.get('name').disable();
    }
  }

  private getClusterByName(clusterName: string): void {
    this.subscriptions.add(this.clusterService.getClusterByName$(clusterName).subscribe(cluster => {
      this.model = cluster;
      this.model.brokers.forEach(() => this.brokers.addBroker());
      this.clusterForm.patchValue(this.model);
      this.defineDisabled(this.clusterForm);
    }));
  }

  saveCluster(): void {
    if (this.clusterForm.valid) {
      this.model = Object.assign({}, this.clusterForm.getRawValue());
      if (this.model.id) {
        this.subscriptions.add(this.clusterService.updateCluster$(this.model).subscribe(() => {
          this.navigateToList();
        }));
      } else {
        this.model.name = this.model.name.trim();
        this.subscriptions.add(this.clusterService.addNewCluster$(this.model).subscribe(() => {
          this.navigateToList();
        }));
      }
    }
  }

  updateTestConnectionBtnState($event: 'default' | 'connecting' | 'connected' | 'failed'): void {
    this.actions.updateTestConnectionBtnState($event);
  }

  private navigateToList(): void {
    this.snackbar.openFromComponent(SnackBarComponent, {
      data: new SnackBarData(`Cluster ${this.model.name} was successfully created.`, SnackBarType.SUCCESS),
      panelClass: ['snackbar', 'snackbar-container-success'],
      duration: 3000
    });

    this.router.navigate(['/clusters']).then(() => {
      this.servers.load();
    });
  }

  getHeaderMessage(): string {
    switch (this.viewMode) {
      case ViewMode.CREATE:
        return `Create new cluster`;
      case ViewMode.EDIT:
        return `Editing cluster ${this.model.name}`;
      case ViewMode.VIEW:
        return `Details of ${this.model.name} cluster`;
    }
    return '';
  }

  nameShouldBeUnique(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return this.clusterService.isClusterNameUnique$(control.value).pipe(map(result => {
        return !result ? {unique: !result} : null;
      }));
    };
  }
}
