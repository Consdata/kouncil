import {Component} from '@angular/core';
import {Schema, SchemaRegistryService} from '@app/schema-registry';
import {Router} from '@angular/router';
import {ServersService} from '@app/common-servers';
import {ViewMode} from '@app/common-utils';

@Component({
  selector: 'app-schema-create',
  template: `
    <app-schema-form (saveEvent)="createSchema($event)"
                     [viewMode]="ViewMode.CREATE"></app-schema-form>
  `,
  styleUrls: ['./schema-create.component.scss']
})
export class SchemaCreateComponent {
  ViewMode: typeof ViewMode = ViewMode;

  constructor(private schemaRegistry: SchemaRegistryService,
              private router: Router,
              private servers: ServersService) {
  }

  createSchema(schema: Schema): void {
    this.schemaRegistry.addNewSchema$(schema, this.servers.getSelectedServerId())
    .pipe()
    .subscribe(() => {
      this.router.navigate(['/schemas']);
    });
  }
}
