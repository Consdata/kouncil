import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ConfirmModel} from './confirm.model';

@Component({
  selector: 'app-confirm',
  template: `
    <div class="header">
      <div class="title">{{data.title}}</div>
      <div class="spacer"></div>
      <mat-icon mat-dialog-close class="close">close</mat-icon>
    </div>

    <div class="subtitle">{{data.subtitle}}</div>

    <div class="section">
      <div>{{data.sectionLine1}}</div>
      <div *ngIf="data.sectionLine2">{{data.sectionLine2}}</div>
    </div>

    <div class="actions">
      <button type="button" mat-dialog-close mat-button disableRipple class="action-button-white">No</button>
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
