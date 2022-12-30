import {Component, Inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA, MatSnackBar} from "@angular/material/snack-bar";
import {SnackBarData} from "./snack-bar-data";

@Component({
  selector: 'app-custom-snack-bar',
  template: `
    <div class="mat-mdc-snack-bar-label" style="display: flex; place-items: center"
         [ngClass]="data.iconClass">
      {{data.message}}
    </div>
    <div class="mat-mdc-snack-bar-actions" style="display: flex; place-items: center">
      <button mat-button class="mat-mdc-snack-bar-action"
              (click)="dismiss()">{{data.action}}</button>
    </div>
  `
})
export class SnackBarComponent {

  constructor(public snackBar: MatSnackBar, @Inject(MAT_SNACK_BAR_DATA) public data: SnackBarData) {
  }

  dismiss() {
    this.snackBar.dismiss();
  }
}
