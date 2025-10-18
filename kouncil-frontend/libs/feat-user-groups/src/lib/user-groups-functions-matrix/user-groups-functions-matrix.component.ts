import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserGroupsService} from '../user-groups/list/user-groups.service';
import {Subscription} from 'rxjs';
import {FunctionGroup, SystemFunction, UserGroup} from './user-groups.model';
import {FunctionsService} from './functions/functions.service';
import {ProgressBarService, ViewMode} from '@app/common-utils';
import {MatCheckboxChange} from '@angular/material/checkbox';

@Component({
  selector: 'app-user-groups-functions-matrix',
  template: `
    <div class="user-groups-header">
      <div class="user-groups-title">
        <app-breadcrumb [name]="'User groups permissions'"></app-breadcrumb>
      </div>

      <div class="user-groups-actions">
        <button type="button" mat-button [disableRipple]="true" class="action-button-white"
                *ngIf="viewMode === ViewMode.EDIT"
                (click)="cancel()">
          Cancel
        </button>
        <button type="button" mat-button [disableRipple]="true" class="action-button-blue"
                *ngIf="viewMode === ViewMode.EDIT"
                (click)="save()">
          Save
        </button>
        <button type="button" mat-button [disableRipple]="true" class="action-button-blue"
                *ngIf="viewMode === ViewMode.VIEW"
                (click)="edit()">
          Edit
        </button>
      </div>

    </div>


    <ng-template #noDataPlaceholder>
      <app-no-data-placeholder [objectTypeName]="'Permissions'"></app-no-data-placeholder>
    </ng-template>

    <mat-accordion
      *ngIf="systemFunctionsGroups && systemFunctionsGroups.size > 0; else noDataPlaceholder"
      class="user-groups-main-container">
      <ng-container *ngFor="let functionGroup of systemFunctionsGroups | keyvalue">

        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title class="user-group-title">
              {{ functionGroup.key.replace('_', " ") | titlecase }}
            </mat-panel-title>
          </mat-expansion-panel-header>

          <div class="user-groups-table-header-row">

            <div class="user-groups-label-column"></div>

            <div class="user-groups-table-header-row-columns">
              <ng-container *ngFor="let systemFunction of functionGroup.value">
                <div class="user-groups-table-header-row-column"
                     [ngStyle]="{'flex-basis': 100/functionGroup.value.length + '%'}">
                  {{ systemFunction.label }}
                </div>
              </ng-container>
            </div>
          </div>

          <ng-container *ngFor="let userGroup of userGroups">
            <div class="user-groups-table-row">
              <div class="user-groups-label-column">
                {{ userGroup.name }}
              </div>
              <div class="user-groups-table-row-columns">
                <ng-container *ngFor="let systemFunction of functionGroup.value">
                  <div [ngStyle]="{'flex-basis': 100/functionGroup.value.length + '%'}"
                       class="user-groups-table-row-column">
                    <mat-checkbox (change)="change($event, userGroup, systemFunction)"
                                  [checked]="functionHasUserGroup(userGroup, systemFunction)"
                                  [disableRipple]="true"
                                  [disabled]="viewMode === ViewMode.VIEW"></mat-checkbox>
                  </div>
                </ng-container>
              </div>
            </div>
          </ng-container>
        </mat-expansion-panel>
      </ng-container>
    </mat-accordion>
  `,
  styleUrls: ['./user-groups-functions-matrix.component.scss'],
})
export class UserGroupsFunctionsMatrixComponent implements OnInit, OnDestroy {

  viewMode: ViewMode = ViewMode.VIEW;
  ViewMode: typeof ViewMode = ViewMode;

  private subscription: Subscription = new Subscription();

  userGroups: Array<UserGroup>;
  systemFunctionsGroups: Map<FunctionGroup, Array<SystemFunction>>;

  systemFunctionsGroupsCopy: Map<FunctionGroup, Array<SystemFunction>> = new Map<FunctionGroup, Array<SystemFunction>>();

  constructor(private userGroupsService: UserGroupsService,
              private functionsService: FunctionsService,
              private progressBarService: ProgressBarService) {
  }

  ngOnInit(): void {
    this.progressBarService.setProgress(true);
    this.subscription.add(this.userGroupsService.getUserGroups$().subscribe(result => {
      this.userGroups = result;
      this.progressBarService.setProgress(false);
    }));

    this.subscription.add(this.functionsService.getFunctions$().subscribe((result: Array<SystemFunction>) => {
      this.systemFunctionsGroups = new Map<FunctionGroup, Array<SystemFunction>>();
      result.forEach((fn: SystemFunction) => {
        if (!this.systemFunctionsGroups.has(fn.functionGroup)) {
          this.systemFunctionsGroups.set(fn.functionGroup, []);
        }
        this.systemFunctionsGroups.get(fn.functionGroup).push(fn);
        this.progressBarService.setProgress(false);
      });
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  functionHasUserGroup(userGroup: UserGroup, systemFunction: SystemFunction): boolean {
    return userGroup.functions.map(sf => sf.name).includes(systemFunction.name);
  }

  cancel(): void {
    this.viewMode = ViewMode.VIEW;
    this.systemFunctionsGroups = structuredClone(this.systemFunctionsGroupsCopy);
  }

  edit(): void {
    this.viewMode = ViewMode.EDIT;
    this.systemFunctionsGroupsCopy = structuredClone(this.systemFunctionsGroups);
  }

  change($event: MatCheckboxChange, userGroup: UserGroup, systemFunction: SystemFunction): void {
    if ($event.checked) {
      // check
      userGroup.functions.push(systemFunction);
    } else {
      // uncheck
      userGroup.functions.splice(userGroup.functions.map(sf => sf.name).indexOf(systemFunction.name), 1);
    }
  }

  save(): void {
    this.viewMode = ViewMode.VIEW;
    this.subscription.add(this.userGroupsService.updatePermissions$(this.userGroups).subscribe(() => {
    }));
  }
}
