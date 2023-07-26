import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild
} from '@angular/core';
import {MatColumnDef, MatTable, MatTableDataSource} from "@angular/material/table";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {TableColumn} from "../table-column/table-column";
import {TableColumnComponent} from "../table-column/table-column.component";
import {TableGroup} from "./table-group";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'app-common-table',
  template: `
    <table mat-table [dataSource]="dataSource">

      <ng-content></ng-content>

      <tr mat-header-row *matHeaderRowDef="getColumnNames(); sticky: true"
          [class]="headerClass"></tr>
      <tr mat-row *matRowDef="let row; columns: getColumnNames();" [ngClass]="rowClass(row)"
          (click)="rowClicked($event, row)"></tr>

      <!-- Group header -->
      <ng-container *ngIf="groupedTable">
        <ng-container matColumnDef="groupHeader">
          <td mat-cell colspan="999" *matCellDef="let group">
            <div class="datatable-group-header">
              <div class="group-header">{{groupHeaderName(group)}}</div>
              <span class="datatable-header-divider"></span>
              <span class="datatable-header-hide" (click)="toggleExpandGroup(group)">
              <span *ngIf="group.expanded">HIDE</span>
              <span *ngIf="!group.expanded">SHOW</span>
            </span>
            </div>
          </td>
        </ng-container>
        <tr mat-row *matRowDef="let row; columns: ['groupHeader']; when: isGroup"></tr>
      </ng-container>

    </table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements AfterContentInit, AfterViewInit {

  allColumns: TableColumn[] = [];
  _columns: TableColumn[] = [];
  _additionalColumns: TableColumn[] = [];
  _actionColumns: TableColumn[] = [];
  _tableData: unknown[];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  _sort: MatSort;

  @Input() headerClass: string = 'default-table-header';
  @Input() groupHeaderName: (group: TableGroup) => string;
  @Input() rowClass: (row) => {} = () => {
    return {}
  };
  @Input() groupedTable: boolean = false;
  @Input() groupByColumns: string[];
  @Output() rowClickedAction: EventEmitter<any> = new EventEmitter<any>();
  @Output() sortEvent: EventEmitter<MatSort> = new EventEmitter<MatSort>();
  @ContentChildren(TableColumnComponent) tableColumnComponents: QueryList<TableColumnComponent>;
  @ViewChild(MatTable, {static: true}) table: MatTable<any>;

  constructor() {
  }

  @Input()
  set tableData(tableData: unknown[]) {
    this._tableData = tableData;
    if (this.groupedTable && this._tableData) {
      this.dataSource = new MatTableDataSource<any>();
      this.dataSource.data = this.addGroups(this._tableData, this.groupByColumns);
    } else {
      this.dataSource.data = this._tableData;
    }
  }

  @Input()
  set columns(columns: TableColumn[]) {
    this._columns = columns;
    this.updateAllColumns();
  }

  @Input()
  set additionalColumns(additionalColumns: TableColumn[]) {
    this._additionalColumns = additionalColumns;
    this.updateAllColumns();
  }

  @Input()
  set actionColumns(actionColumns: TableColumn[]) {
    this._actionColumns = actionColumns;
    this.updateAllColumns();
  }

  @Input()
  set sort(sort: MatSort) {
    if (sort) {
      this._sort = sort;
      this.dataSource.sort = sort;
      this.dataSource.sort.sortChange.subscribe((sort: MatSort) => this.sortEvent.emit(sort));
    }
  }

  ngAfterContentInit() {
    this.tableColumnComponents.forEach(columnDef => this.table.addColumnDef(columnDef.columnDef));
    this.updateAllColumns();
  }

  private updateAllColumns() {
    this.allColumns = this._additionalColumns.concat(this._columns.concat(this._actionColumns));
  }

  ngAfterViewInit() {
    if (this.groupedTable && this._tableData) {
      this.dataSource.data = this.addGroups(this._tableData, this.groupByColumns);
      this.dataSource.filterPredicate = this.customFilterPredicate.bind(this);
      this.dataSource.filter = performance.now().toString();
    } else {
      this.dataSource.data = this._tableData;
    }

    this.tableColumnComponents.changes.subscribe(() => {
      // remove all the columns
      let from: Array<MatColumnDef> = Array.from(this.table["_customColumnDefs"].values());
      from.forEach((column: MatColumnDef) => this.table.removeColumnDef(column));
      this.tableColumnComponents.forEach(columnDef => {
        this.table.addColumnDef(columnDef.columnDef);
      });
    });
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

  isGroup(index, item): boolean {
    return item.level;
  }

  addGroups(data: any[], groupByColumns: string[]): any[] {
    const rootGroup: TableGroup = new TableGroup();
    rootGroup.expanded = true;
    return this.getSublevel(data, 0, groupByColumns, rootGroup);
  }

  getSublevel(data: any[], level: number, groupByColumns: string[], parent: TableGroup): any[] {
    if (level >= groupByColumns.length) {
      return data;
    }
    const groups = this.uniqueBy(
      data.map(
        row => {
          const result: TableGroup = new TableGroup();
          result.level = level + 1;
          result.parent = parent;
          for (let i = 0; i <= level; i++) {
            result[groupByColumns[i]] = row[groupByColumns[i]];
          }
          return result;
        }
      ),
      JSON.stringify);

    const currentColumn = groupByColumns[level];
    let subGroups = [];
    groups.forEach(group => {
      const rowsInGroup = data.filter(row => group[currentColumn] === row[currentColumn]);
      group.totalCounts = rowsInGroup.length;
      const subGroup = this.getSublevel(rowsInGroup, level + 1, groupByColumns, group);
      subGroup.unshift(group);
      subGroups = subGroups.concat(subGroup);
    });
    return subGroups;
  }

  uniqueBy(a, key) {
    const seen = {};
    return a.filter((item) => {
      const k = key(item);
      return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    });
  }

  toggleExpandGroup(group: TableGroup) {
    group.expanded = !group.expanded;
    this.dataSource.filter = performance.now().toString();
  }

  customFilterPredicate(data: any | TableGroup): boolean {
    return data instanceof TableGroup ? data.visible : this.getDataRowVisible(data);
  }

  getDataRowVisible(data: any): boolean {
    const groupRows = this.dataSource.data.filter((row) => {
      if (!(row instanceof TableGroup)) {
        return false;
      }
      let match = true;
      this.groupByColumns.forEach((column) => {
        if (!row[column] || !data[column] || row[column] !== data[column]) {
          match = false;
        }
      });
      return match;
    });

    if (groupRows.length === 0) {
      return true;
    }
    const parent = groupRows[0] as TableGroup;

    return parent.visible && parent.expanded;
  }

  rowClicked($event: MouseEvent, row) {
    const element = $event.target as HTMLElement;
    if ($event.type === 'click' && element.nodeName !== 'MAT-ICON' && element.nodeName !== 'BUTTON') {
      this.rowClickedAction.emit(row);
    }
  }
}
