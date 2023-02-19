import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild
} from '@angular/core';
import {MatTable, MatTableDataSource} from "@angular/material/table";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {TableColumn} from "../table-column/table-column";
import {TableColumnComponent} from "../table-column/table-column.component";

@Component({
  selector: 'app-common-table',
  template: `
    <table mat-table [dataSource]="dataSource">

      <ng-content></ng-content>

      <tr mat-header-row *matHeaderRowDef="getColumnNames(); sticky: true"></tr>
      <tr mat-row *matRowDef="let row; columns: getColumnNames();"
          (click)="rowClickedAction.emit(row)"></tr>
    </table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements AfterContentInit {

  allColumns: TableColumn[] = [];
  @Input() additionalColumns: TableColumn[] = [];
  @Input() columns: TableColumn[] = [];
  @Output() rowClickedAction: EventEmitter<any> = new EventEmitter<any>();
  @ContentChildren(TableColumnComponent) tableColumnComponents: QueryList<TableColumnComponent>;
  @ViewChild(MatTable, {static: true}) table: MatTable<any>;

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

  constructor() {
  }

  ngAfterContentInit() {
    this.tableColumnComponents.forEach(columnDef => this.table.addColumnDef(columnDef.columnDef));
    this.allColumns = this.additionalColumns.concat(this.columns);
  }

  @Input() set tableData(value: unknown[]) {
    this.dataSource.data = value;
  }

  getColumnNames() {
    return this.allColumns.map(column => column.name);
  }

  drop(event: CdkDragDrop<string[]>) {
    let previousIndex = event.previousIndex;
    let currentIndex = event.currentIndex;
    const lastStickyIndex = this.allColumns.map(column => column.sticky).lastIndexOf(true);

    if (this.allColumns[event.previousIndex].sticky) {
      if (currentIndex > lastStickyIndex) {
        currentIndex = lastStickyIndex;
      }
    } else {
      if (lastStickyIndex >= 0 && currentIndex <= lastStickyIndex) {
        currentIndex = lastStickyIndex + 1;
      }
    }

    moveItemInArray(this.allColumns, previousIndex, currentIndex);
  }
}
