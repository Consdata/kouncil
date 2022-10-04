import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-confirm',
  template: `
    <div class="drawer-header">
      <div class="drawer-title">Delete {{data.objectType}}</div>
      <div class="spacer"></div>
      <mat-icon mat-dialog-close class="close">close</mat-icon>
    </div>

    <div class="drawer-subtitle">Are you sure you want to delete:</div>

    <div class="drawer-section-title">{{data.objectName}}</div>

    <div class="actions">
      <button type="button" mat-dialog-close mat-button disableRipple class="action-button-white">No, keep it</button>
      <span class="spacer"></span>
      <button mat-button disableRipple class="action-button-black" (click)="delete()">Yes, delete it</button>
    </div>
  `,
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent {

  constructor(
    private dialogRef: MatDialogRef<ConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      objectType: string,
      objectName: string
    }) {
  }

  delete(): void {
    this.dialogRef.close(true);
  }

}
