import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {TableColumn} from "./table-column";

@Component({
  selector: 'app-common-table',
  template: `
    <table mat-table [dataSource]="dataSource" matSort
           cdkDropList cdkDropListOrientation="horizontal"
           (cdkDropListDropped)="drop($event)">

      <ng-container *ngFor="let column of columns; let i = index"
                    matColumnDef="{{column.name}}"
                    [sticky]="column.sticky">
        <th mat-header-cell *matHeaderCellDef [mat-sort-header]="column.prop"
            [style.min-width.px]="column.width" cdkDrag [cdkDragDisabled]="!column.draggable"
            [resizeColumn]="column.resizeable" [index]="i">
          {{column.name}}
        </th>
        <td mat-cell *matCellDef="let element" [style.min-width.px]="column.width"
            class="cell">
          {{
          column.isDate
            ? (element[column.prop] | date: column.dateFormat)
            : element[column.prop]
          }}
        </td>
      </ng-container>

      <tr mat-header-row
          *matHeaderRowDef="getColumnNames(); sticky: true"></tr>
      <tr mat-row *matRowDef="let row; columns: getColumnNames();"
          (click)="rowClickedAction.emit(row)"></tr>
    </table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./table.component.scss']
})
export class TableComponent {

  @Input() columns: TableColumn[] = [];
  @Output() rowClickedAction: EventEmitter<any> = new EventEmitter<any>();

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

  constructor() {
  }

  @ViewChild(MatSort, {static: false}) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  @Input() set tableData(value: unknown[]) {
    this.dataSource.data = value;
  }

  getColumnNames() {
    return this.columns.map(column => column.name);
  }

  drop(event: CdkDragDrop<string[]>) {
    let previousIndex = event.previousIndex;
    let currentIndex = event.currentIndex;
    const lastStickyIndex = this.columns.map(column => column.sticky).lastIndexOf(true);

    if (this.columns[event.previousIndex].sticky) {
      if (currentIndex > lastStickyIndex) {
        currentIndex = lastStickyIndex;
      }
    } else {
      if (lastStickyIndex >= 0 && currentIndex <= lastStickyIndex) {
        currentIndex = lastStickyIndex + 1;
      }
    }

    moveItemInArray(this.columns, previousIndex, currentIndex);
  }
}
