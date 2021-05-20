import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {BrokerConfig} from '../brokers/broker';
import {DatatableComponent} from '@swimlane/ngx-datatable';
import {first} from 'rxjs/operators';

@Component({
  selector: 'app-broker',
  templateUrl: './broker.component.html',
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
