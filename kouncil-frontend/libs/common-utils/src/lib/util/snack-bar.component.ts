import {Component, Inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA, MatSnackBar} from '@angular/material/snack-bar';
import {SnackBarData, SnackBarType} from './snack-bar-data';

@Component({
  selector: 'app-custom-snack-bar',
  template: `
    <div class="mat-mdc-snack-bar-label snackbar-label" [ngClass]="getLabelClass()">
      {{ data.message }}
    </div>
    <div class="mat-mdc-snack-bar-actions snackbar-actions" *ngIf="data.action">
      <button mat-button class="mat-mdc-snack-bar-action" [ngClass]="getButtonClass()"
              (click)="dismiss()">
        {{ data.action }}
      </button>
    </div>
  `,
  styleUrls: ['./snack-bar.component.scss']
})
export class SnackBarComponent {

  constructor(public snackBar: MatSnackBar, @Inject(MAT_SNACK_BAR_DATA) public data: SnackBarData) {
  }

  dismiss(): void {
    this.snackBar.dismiss();
  }

  getButtonClass(): string {
    switch (this.data.snackbarType) {
      case SnackBarType.INFO:
        return 'snackbar-info-action-button';
      case SnackBarType.SUCCESS:
        return 'snackbar-success-action-button';
      case SnackBarType.ERROR:
        return 'snackbar-error-action-button';
    }
  }

  getLabelClass(): string {
    switch (this.data.snackbarType) {
      case SnackBarType.INFO:
        return 'snackbar-info-label';
      case SnackBarType.SUCCESS:
        return 'snackbar-success-label';
      case SnackBarType.ERROR:
        return 'snackbar-error-label';
    }
  }
}
