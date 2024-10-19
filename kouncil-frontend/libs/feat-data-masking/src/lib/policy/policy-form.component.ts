import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {ViewMode} from '@app/common-utils';
import {Policy, PolicyField, PolicyResource} from '../policy.model';
import {
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {SelectableItem} from '@app/common-components';
import {PolicyService} from './policy.service';
import {
  PolicyFormFieldsComponent
} from './sections/policy-form-fields/policy-form-fields.component';
import {
  PolicyFormResourcesComponent
} from './sections/policy-form-resources/policy-form-resources.component';
import {first} from 'rxjs/operators';
import {Clusters, ClustersService} from '@app/feat-clusters';

@Component({
  selector: 'app-policy',
  template: `
    <form class="policy-form" autocomplete="off" (ngSubmit)="savePolicy()">
      <div class="policy-form-header">
        <app-breadcrumb [parentName]="'Policies'" [parentLink]="'/data-masking-policies'"
                        [name]="getHeaderMessage()"></app-breadcrumb>
      </div>

      <div class="policy-form-container">
        <app-common-text-field [label]="'Name'" [required]="ViewMode.VIEW !== viewMode"
                               [form]="policyForm"
                               [controlName]="'name'"></app-common-text-field>

        <app-policy-fields [policyForm]="policyForm"
                           [viewMode]="viewMode"
        ></app-policy-fields>

        <app-policy-resources [policyForm]="policyForm"
                              [viewMode]="viewMode"
                              [clusters]="clusters"
        ></app-policy-resources>
      </div>

      <app-policy-actions [policyForm]="policyForm"
                          [viewMode]="viewMode"
                          [policyId]="model.id"></app-policy-actions>
    </form>
  `,
  styleUrls: ['./policy-form.component.scss']
})
export class PolicyFormComponent implements OnInit, OnDestroy {

  @Input() viewMode: ViewMode;

  model: Policy = {} as Policy;
  subscriptions: Subscription = new Subscription();
  ViewMode: typeof ViewMode = ViewMode;
  policyForm: FormGroup = new FormGroup({
    id: new FormControl(),
    name: new FormControl('', [Validators.required]),
    applyToAllResources: new FormControl(false),
    fields: new FormArray([], {
      validators: this.validateFields(),
      updateOn: 'change'
    }),
    resources: new FormArray([], {
      validators: this.validateResources(),
      updateOn: 'change'
    })
  });

  clusters: Array<SelectableItem> = [];


  @ViewChild(PolicyFormFieldsComponent) fields: PolicyFormFieldsComponent;
  @ViewChild(PolicyFormResourcesComponent) resources: PolicyFormResourcesComponent;


  constructor(private route: ActivatedRoute,
              private router: Router,
              private policyService: PolicyService,
              private clustersService: ClustersService) {
  }

  ngOnInit(): void {
    this.subscriptions.add(this.clustersService.getClusters$()
    .pipe(first())
    .subscribe((data: Clusters) => {
      data.clusters.forEach(cluster => {
        this.clusters.push(new SelectableItem(cluster.name, cluster.id, false));
      });

      this.processRouteParams();
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getHeaderMessage(): string {
    switch (this.viewMode) {
      case ViewMode.CREATE:
        return `Create a new policy`;
      case ViewMode.EDIT:
        return `Edit ${this.model.name} policy`;
      case ViewMode.VIEW:
        return `${this.model.name}`;
    }
    return '';
  }

  private processRouteParams() {
    this.subscriptions.add(this.route.params.subscribe((params) => {
      const policyId = params['id'];
      if (policyId) {
        this.getPolicyById(policyId);
      }
    }));
  }

  private getPolicyById(policyId: number) {
    this.subscriptions.add(this.policyService.getPolicyById$(policyId).subscribe(policy => {
      this.model = policy;
      this.model.fields.forEach(() => this.fields.addField());
      this.model.resources.forEach(() => this.resources.addResource());
      this.policyForm.patchValue(this.model);
      this.defineDisabled(this.policyForm);
    }));
  }

  private validateResources(): ValidatorFn {
    return (): ValidationErrors | null => {
      const applyToAllResources = this.policyForm?.get('applyToAllResources')?.value;
      const resources: Array<PolicyResource> = this.policyForm?.get('resources')?.value;
      return !applyToAllResources && resources && (resources.length === 0 || resources.some(resource => !resource.cluster || !resource.topic))
        ? {required: true}
        : null;
    };
  }

  private validateFields(): ValidatorFn {
    return (): ValidationErrors | null => {
      const fields: Array<PolicyField> = this.policyForm?.get('fields')?.value;
      return fields && (fields.length === 0 || fields.some(field => !field.field || !field.maskingType)) ? {required: true} : null;
    };
  }

  savePolicy(): void {
    if (this.policyForm.valid) {
      this.model = Object.assign({}, this.policyForm.getRawValue());
      if (this.model.id) {
        this.subscriptions.add(this.policyService.updatePolicy$(this.model).subscribe(() => {
          this.navigateToList();
        }));
      } else {
        this.subscriptions.add(this.policyService.addNewPolicy$(this.model).subscribe(() => {
          this.navigateToList();
        }));
      }
    }
  }

  private navigateToList(): void {
    this.router.navigate(['/data-masking-policies']);
  }

  private defineDisabled(form: FormGroup | FormArray) {
    if (ViewMode.VIEW === this.viewMode) {
      Object.keys(form.controls).forEach(key => {
        if (form.get(key) instanceof FormGroup || form.get(key) instanceof FormArray) {
          this.defineDisabled((form.get(key) as FormArray | FormGroup));
        }
        form.get(key).disable();
      });
    }
  }
}
