import {Component, OnInit} from '@angular/core';
import {SchemaRegistryService} from "../schema-registry.service";
import {Schemas} from "../schemas.model";
import {ServersService} from "@app/common-servers";
import {TableColumn} from "@app/common-components";
import {ProgressBarService} from "@app/common-utils";

@Component({
  selector: 'app-schemas',
  template: `
    <div class="kafka-topics" *ngIf="filtered">
      <ng-template #noDataPlaceholder>
        <app-no-data-placeholder [objectTypeName]="'Schemas'"></app-no-data-placeholder>
      </ng-template>

      <app-common-table *ngIf="filtered && filtered.length > 0; else noDataPlaceholder"
                        [tableData]="filtered" [columns]="columns" matSort>

        <ng-container *ngFor="let column of columns; let index = index">
          <app-common-table-column [column]="column" [index]="index"></app-common-table-column>
        </ng-container>

      </app-common-table>
    </div>
  `,
  styleUrls: ['./schemas.component.scss']
})
export class SchemasComponent implements OnInit {

  filtered: Schemas[] = [];

  columns: TableColumn[] = [
    {
      name: 'Subject name',
      prop: 'subjectName',
      sticky: false,
      resizeable: true,
      sortable: true,
      draggable: true
    },
    {
      name: 'Topic name',
      prop: 'topicName',
      sticky: false,
      resizeable: true,
      sortable: true,
      draggable: true
    },
    {
      name: 'Message format',
      prop: 'messageFormat',
      sticky: false,
      resizeable: true,
      sortable: true,
      draggable: true
    },
    {
      name: 'Version',
      prop: 'version',
      sticky: false,
      resizeable: true,
      sortable: true,
      draggable: true
    }
  ];

  constructor(private progressBarService: ProgressBarService,
              private schemaRegistry: SchemaRegistryService,
              private servers: ServersService) {
  }

  ngOnInit() {
    this.progressBarService.setProgress(true);
    this.loadSchemas();
  }

  private loadSchemas() {
    this.schemaRegistry.loadAllSchemasForServer$(this.servers.getSelectedServerId())
    .subscribe((data: Schemas[]) => {
      this.filtered = data
      this.progressBarService.setProgress(false);
    })
  }
}
