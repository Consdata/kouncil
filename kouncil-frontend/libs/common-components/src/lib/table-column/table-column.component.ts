import {ChangeDetectionStrategy, Component, Input, TemplateRef, ViewChild} from '@angular/core';
import {TableColumn} from './table-column';
import {MatColumnDef} from '@angular/material/table';

@Component({
  selector: 'app-common-table-column',
  template: `
    <ng-container matColumnDef="{{column.name}}" [sticky]="column.sticky">

      <th mat-header-cell *matHeaderCellDef [mat-sort-header]="column.prop"
          [style.min-width.px]="column.width"
          [appResizeColumn]="column.resizeable" [index]="index">
        <div cdkDrag [cdkDragDisabled]="!column.draggable">
          {{ column.name }}
        </div>
      </th>
      <td mat-cell *matCellDef="let element" [style.min-width.px]="column.width"
          class="cell">

        <span *ngIf="!template" [title]="getColumnValue(element, column)"
              [ngClass]="column.columnClass ? column.columnClass(getColumnValue(element, column)): ''">
          {{ getColumnValue(element, column) }}
        </span>

        <ng-container *ngIf="template" [ngTemplateOutlet]="template"
                      [ngTemplateOutletContext]="{$implicit: element}">
        </ng-container>
      </td>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./table-column.component.scss']
})
export class TableColumnComponent {

  @Input() column: TableColumn;
  @Input() index: number;
  @Input() value: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() template: TemplateRef<any>;
  @ViewChild(MatColumnDef, {static: false}) columnDef: MatColumnDef;

  getColumnValue(element: unknown, column: TableColumn): string | unknown {
    return column.valueFormatter
      ? column.valueFormatter(element[column.prop])
      : element[column.prop];
  }
}
