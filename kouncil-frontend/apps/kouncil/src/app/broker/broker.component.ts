import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {BrokerConfig} from '../brokers/broker';
import {first} from 'rxjs/operators';
import {TableColumn} from '@app/common-components';

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

        <section *ngIf="isAnimationDone">
          <app-common-table [tableData]="data.config" [columns]="columns"></app-common-table>
        </section>
        <div *ngIf="!isAnimationDone" class="kafka-progress"></div>
      </div>
    </div>
  `,
  styleUrls: ['./broker.component.scss']
})
export class BrokerComponent implements OnInit {

  isAnimationDone: boolean = false;

  columns: TableColumn[] = [
    {
      name: 'name',
      prop: 'name',
      sticky: false,
      draggable: true,
      resizeable: true,
      width: 350,
      sortable: true
    },
    {
      name: 'value',
      prop: 'value',
      sticky: false,
      draggable: true,
      resizeable: true,
      sortable: true
    },
    {
      name: 'source',
      prop: 'source',
      sticky: false,
      draggable: true,
      resizeable: true,
      sortable: true
    },
  ];

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
