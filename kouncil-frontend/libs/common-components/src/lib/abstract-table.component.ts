import {Component, ViewChild} from '@angular/core';
import {MatSort} from '@angular/material/sort';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {TableComponent} from './table/table.component';

@Component({
  template: ''
})
export abstract class AbstractTableComponent {

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(TableComponent, {static: false}) table: TableComponent;

  @ViewChild(MatSort, {static: false}) set content(sort: MatSort) {
    if (this.table) {
      this.sort = sort;
    }
  }

  drop($event: CdkDragDrop<string[]>): void {
    this.table.drop($event);
  }
}
