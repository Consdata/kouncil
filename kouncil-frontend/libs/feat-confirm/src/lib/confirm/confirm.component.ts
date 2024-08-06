import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {ConfirmModel} from './confirm.model';

@Component({
  selector: 'app-confirm',
  template: `
    <div mat-dialog-title class="header">
      <div class="title">{{data.title}}</div>
      <div class="spacer"></div>
      <mat-icon mat-dialog-close class="material-symbols-outlined close">close</mat-icon>
    </div>

    <mat-dialog-content class="mat-typography">
      <div class="subtitle">{{data.subtitle}}</div>

      <div class="section">
        <div>{{data.sectionLine1}}</div>
        <div *ngIf="data.sectionLine2">{{data.sectionLine2}}</div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions>
      <button mat-flat-button mat-dialog-close>No</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">Yes</button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmModel) {
  }

}
