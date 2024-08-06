import {Component} from '@angular/core';
import {Schema, SchemaRegistryService} from '@app/schema-registry';
import {Router} from '@angular/router';
import {ServersService} from '@app/common-servers';
import {ViewMode} from '@app/common-utils';

@Component({
  selector: 'app-schema-edit',
  template: `
    <app-schema-form (saveEvent)="updateSchema($event)"
                     [viewMode]="ViewMode.EDIT"></app-schema-form>
  `,
  styleUrls: ['./schema-edit.component.scss']
})
export class SchemaEditComponent {
  ViewMode: typeof ViewMode = ViewMode;
  constructor(private schemaRegistry: SchemaRegistryService,
              private router: Router,
              private servers: ServersService) {
  }

  updateSchema(schema: Schema): void {
    this.schemaRegistry.addNewSchemaVersion$(schema, this.servers.getSelectedServerId())
    .pipe()
    .subscribe(() => {
      this.router.navigate(['/schemas']);
    });
  }
}
