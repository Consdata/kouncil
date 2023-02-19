import {Component, ViewChild} from '@angular/core';
import {MatSort} from "@angular/material/sort";
import {TableComponent} from "@app/common-components";
import {CdkDragDrop} from "@angular/cdk/drag-drop";

@Component({
  template: ''
})
export abstract class AbstractTableComponent {

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(TableComponent, {static: false}) table: TableComponent;

  @ViewChild(MatSort, {static: false}) set content(sort: MatSort) {
    if (this.table) {
      this.table.dataSource.sort = sort;
    }
  }

  drop($event: CdkDragDrop<string[]>) {
    this.table.drop($event);
  }
}
