import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {BrokerConfig} from '../brokers/broker';
import {DatatableComponent} from '@swimlane/ngx-datatable';
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

  @ViewChild('brokerConfig') brokerTable: DatatableComponent;

  public isAnimationDone = false;

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
