import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ConfirmModel} from './confirm.model';

@Component({
  selector: 'app-confirm',
  template: `
    <div class="drawer-header">
      <div class="drawer-title">{{data.title}}</div>
      <div class="spacer"></div>
      <mat-icon mat-dialog-close class="close">close</mat-icon>
    </div>

    <div class="drawer-subtitle">{{data.subtitle}}</div>

    <div class="drawer-section-title">{{data.section}}</div>

    <div class="actions">
      <button type="button" mat-dialog-close mat-button disableRipple class="action-button-white">No</button>
      <span class="spacer"></span>
      <button mat-button disableRipple class="action-button-black" (click)="confirm()">Yes</button>
    </div>
  `,
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent {

  constructor(
    private dialogRef: MatDialogRef<ConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel) {
  }

  confirm(): void {
    this.dialogRef.close(true);
  }

}
