import {Component, Inject, OnInit} from '@angular/core';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {BrokerConfig} from '../brokers/broker';
import {first} from 'rxjs/operators';

@Component({
  selector: 'app-broker',
  template: `
    <div class="broker-details">
      <div class="drawer-header">
        <div class="drawer-title">Broker details</div>
        <div class="spacer"></div>
        <mat-icon mat-dialog-close class="close">close</mat-icon>
      </div>

      <div class="broker-details-table">
        <ngx-datatable *ngIf="isAnimationDone" class="config-table-detail material"
                       [rows]="data.config"
                       [rowHeight]="48"
                       [headerHeight]="48"
                       [scrollbarH]="false"
                       [scrollbarV]="false"
                       [columnMode]="'force'"
                       #brokerConfig>
          <ngx-datatable-column [width]="350" prop="name" name="name"></ngx-datatable-column>
          <ngx-datatable-column prop="value" name="value"></ngx-datatable-column>
          <ngx-datatable-column prop="source" name="source"></ngx-datatable-column>
        </ngx-datatable>
        <div *ngIf="!isAnimationDone" class="kafka-progress"></div>
      </div>
    </div>
  `,
  styleUrls: ['./broker.component.scss']
})
export class BrokerComponent implements OnInit {

  isAnimationDone: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<BrokerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      config: BrokerConfig[]
    }) {
  }

  ngOnInit(): void {
    // ngx datatable gets its width completely wrong
    // if displayed before container reaches its final size
    this.dialogRef.afterOpened().pipe(first()).subscribe(() => {
      this.isAnimationDone = true;
    });
  }

}
