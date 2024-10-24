import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {ServersService} from '@app/common-servers';
import {first} from 'rxjs/operators';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import {map, Observable, of, Subscription} from 'rxjs';
import {SnackBarComponent, SnackBarData, ViewMode} from '@app/common-utils';
import {UserGroupService} from './user-group.service';
import {UserGroup} from '../../user-groups-functions-matrix/user-groups.model';

@Component({
  selector: 'app-user-group-form',
  template: `
    <div mat-dialog-title class="drawer-header">
      <div class="drawer-title">
        {{ header }}
      </div>
      <div class="spacer"></div>
      <mat-icon mat-dialog-close class="material-symbols-outlined close">close</mat-icon>
    </div>

    <form [formGroup]="userGroupForm" (ngSubmit)="save()" class="form user-group-form">
      <div mat-dialog-content class="user-group-info">
        <div class="user-group-form-field">
          <app-common-text-field [form]="userGroupForm" [controlName]="'code'"
                                 [label]="'Code'" [required]="true"></app-common-text-field>
        </div>

        <div class="user-group-form-field">
          <app-common-text-field [form]="userGroupForm" [controlName]="'name'"
                                 [label]="'Name'" [required]="true"></app-common-text-field>
        </div>
      </div>
    </form>

    <div mat-dialog-actions class="actions">
      <button type="button" mat-dialog-close mat-button [disableRipple]="true"
              class="action-button-white">
        Cancel
      </button>
      <button mat-button [disableRipple]="true"
              class="action-button-blue" type="submit" [disabled]="!userGroupForm.valid">
        Save
      </button>
    </div>
  `,
  styleUrls: ['./user-group-form.component.scss']
})
export class UserGroupFormComponent implements OnInit, OnDestroy {

  model: UserGroup;
  header: string = 'Create new user group';
  userGroupForm: FormGroup = new FormGroup({
    id: new FormControl(),
    code: new FormControl('', {
      validators: [Validators.required, this.noOnlyWhitespace],
      asyncValidators: this.isUserGroupCodeUnique(),
      updateOn: 'change'
    }),
    name: new FormControl('', [Validators.required, this.noOnlyWhitespace]),
  });
  viewMode: ViewMode = ViewMode.CREATE;
  ViewMode: typeof ViewMode = ViewMode;

  private subscriptions: Subscription = new Subscription();

  constructor(private userGroupService: UserGroupService,
              private servers: ServersService,
              private dialog: MatDialog,
              private snackbar: MatSnackBar,
              @Inject(MAT_DIALOG_DATA) public data: number) {
  }

  ngOnInit(): void {
    if (this.data) {
      this.loadUserGroup(this.data);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  protected loadUserGroup(id: number): void {
    this.subscriptions.add(this.userGroupService.getUserGroup$(id)
    .subscribe((result: UserGroup) => {
      this.viewMode = ViewMode.EDIT;
      this.model = result;
      this.header = `Update user group ${this.model.name}`;
      this.userGroupForm.patchValue(this.model);
    }));
  }

  save(): void {
    this.model = Object.assign({}, this.userGroupForm.getRawValue());
    if (!this.data) {
      this.process(this.userGroupService.createUserGroup$(this.model),
        `User group ${this.model.name} was successfully created`,
        `Error occurred while creating user group ${this.model.name}`);
    } else {
      this.process(this.userGroupService.updateUserGroup$(this.model),
        `User group ${this.model.name} was successfully updated`,
        `Error occurred while updating user group ${this.model.name}`);
    }
  }

  private process(observable$: Observable<void>, successMsg: string, errorMsg: string) {
    this.subscriptions.add(observable$.pipe(first())
    .subscribe({
      next: () => {
        this.dialog.openDialogs.forEach(dialog => {
          if (dialog.componentInstance === this) {
            dialog.close();
          }
        });
        this.snackbar.openFromComponent(SnackBarComponent, {
          data: new SnackBarData(successMsg, 'snackbar-success', ''),
          panelClass: ['snackbar'],
          duration: 3000,
        });
      },
      error: () => {
        this.snackbar.openFromComponent(SnackBarComponent, {
          data: new SnackBarData(errorMsg, 'snackbar-error', ''),
          panelClass: ['snackbar'],
          duration: 3000,
        });
      }
    }));
  }

  isUserGroupCodeUnique(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return (this.model === undefined || this.model.code !== control.value)
        ? this.userGroupService.isUserGroupCodeUnique$(this.model !== undefined ? this.model.id : null, control.value)
        .pipe(map(result => {
          return !result ? {unique: !result} : null;
        }))
        : of(null);
    };
  }

  noOnlyWhitespace(control: FormControl): ValidationErrors | null {
    if (control.value) {
      const isWhitespace = (control.value || '').trim().length === 0;
      return !isWhitespace ? null : {'noOnlyWhitespace': true};
    }
    return null;
  }
}
