import {Component, Input} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {SelectableItem} from '@app/common-components';

@Component({
  selector: 'app-policy-user-groups',
  template: `
    <div class="user-groups-section">
      <div class="user-groups-section-header-container">
        <div class="user-groups-section-header">User groups</div>
      </div>

      <div class="user-groups-fields">

        <app-common-autocomplete class="full-width"
                                 [label]="'User groups names'"
                                 [data]="groups"
                                 [form]="policyForm"
                                 [controlName]="'userGroups'"
                                 [placeholder]="'User groups for which the policy will be applied.'"
                                 [required]="true"></app-common-autocomplete>
      </div>
    </div>
  `,
  styleUrls: ['./policy-form-user-groups.component.scss']
})
export class PolicyFormUserGroupsComponent {

  @Input() policyForm: FormGroup;
  @Input() groups: Array<SelectableItem>;

}
