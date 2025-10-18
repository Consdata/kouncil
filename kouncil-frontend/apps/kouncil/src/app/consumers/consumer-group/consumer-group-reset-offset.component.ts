import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {ConsumerGroupService} from './consumer-group.service';
import {
  ConsumerGroupResetOffset,
  ConsumerGroupResetOffsetType
} from './consumer-group-reset-offset.model';
import {SelectableItem} from '@app/common-components';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {SnackBarComponent, SnackBarData, SnackBarType} from '@app/common-utils';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-kafka-consumer-group-reset-offset',
  template: `
    <div mat-dialog-title class="header">
      <div class="drawer-title">
        Reset consumer group {{ data.groupId }} offset
      </div>

      <div class="spacer"></div>
      <div class="close-icon">
        <mat-icon mat-dialog-close class="material-symbols-outlined close">close</mat-icon>
      </div>
    </div>


    <form [formGroup]="resetOffsetForm" (ngSubmit)="reset()">
      <mat-dialog-content>

        <app-common-select-field [form]="resetOffsetForm" [controlName]="'resetType'"
                                 [label]="'Reset offset type'"
                                 [options]="resetOffsetTypes"></app-common-select-field>

        <app-common-date-time-field *ngIf="typeIs([ConsumerGroupResetOffsetType.TIMESTAMP])"
                                    [form]="resetOffsetForm"
                                    [dateControlName]="'date'"
                                    [timeControlName]="'time'"
                                    [label]="'Timestamp'"></app-common-date-time-field>

        <app-common-number-field *ngIf="typeIs([ConsumerGroupResetOffsetType.OFFSET_NUMBER])"
                                 [form]="resetOffsetForm" [controlName]="'offsetNo'"
                                 [label]="'Offset number'"></app-common-number-field>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button type="button" mat-dialog-close mat-button [disableRipple]="true"
                class="action-button-white">
          Cancel
        </button>
        <button mat-button [disableRipple]="true"
                class="action-button-blue" type="submit" [disabled]="!resetOffsetForm.valid">
          Reset offset
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styleUrls: ['./consumer-group-reset-offset.component.scss']
})
export class ConsumerGroupResetOffsetComponent {

  ConsumerGroupResetOffsetType: typeof ConsumerGroupResetOffsetType = ConsumerGroupResetOffsetType;
  resetOffsetTypes: SelectableItem[] = Object.keys(ConsumerGroupResetOffsetType)
  .map(type => new SelectableItem(ConsumerGroupResetOffsetType[type], type, false));

  resetOffsetForm: FormGroup = new FormGroup({
    resetType: new FormControl(null, [Validators.required]),
    date: new FormControl(null),
    time: new FormControl(null),
    offsetNo: new FormControl(null)
  });

  constructor(private readonly dialog: MatDialog,
              private readonly consumerGroupService: ConsumerGroupService,
              @Inject(MAT_DIALOG_DATA) public data: ConsumerGroupResetOffset,
              private readonly snackbar: MatSnackBar) {
  }

  reset(): void {
    const result: ConsumerGroupResetOffset = {
      ...this.data,
      ...this.resetOffsetForm.getRawValue()
    };

    result.timestampMillis = new Date(`${result.date}T${result.time}`).getTime();

    this.consumerGroupService.resetOffset$(result).subscribe({
      next: () => {
        this.dialog.closeAll();
        this.snackbar.openFromComponent(SnackBarComponent, {
          data: new SnackBarData(`The offsets for consumer group ${this.data.groupId} have been successfully reset.`, SnackBarType.SUCCESS, ''),
          panelClass: ['snackbar', 'snackbar-container-success'],
          duration: 3000,
        });
      }
    });
  }

  typeIs(types: Array<ConsumerGroupResetOffsetType>): boolean {
    return types.includes(ConsumerGroupResetOffsetType[this.resetOffsetForm.controls['resetType'].value]);
  }
}
