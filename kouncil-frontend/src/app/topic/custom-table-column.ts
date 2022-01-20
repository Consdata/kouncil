import {TableColumn} from '@swimlane/ngx-datatable/lib/types/table-column.type';
import {TemplateRef} from '@angular/core';

export interface CustomTableColumn extends TableColumn {
  nameShort: string;
  headerTemplate?: TemplateRef<unknown>;
}
