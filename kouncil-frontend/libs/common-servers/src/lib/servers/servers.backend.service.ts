import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Server} from './server';
import {ServersService} from './servers.service';
import {SchemaRegistryService, SchemaStateService} from '@app/schema-registry';

@Injectable()
export class ServersBackendService extends ServersService {
  constructor(private http: HttpClient,
              private schemaRegistryService: SchemaRegistryService,
              private schemaStateService: SchemaStateService) {
    super();
  }

  load(): Promise<boolean> {
    return new Promise((resolve) => {
      this.http.get(`/api/connection`).subscribe((value) => {
        this.servers = [];
        if (value != null) {
          const lastSelectedServer = localStorage.getItem('lastSelectedServer');
          for (const key in value) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
              this.servers.push(new Server(key, value[key]));
              if (key === lastSelectedServer) {
                this.selectedServerId = key;
              }
            }
          }

          if ((!this.selectedServerId
              || !this.servers.map((server: Server) => server.serverId).includes(this.selectedServerId))
            && this.servers.length > 0) {
            this.selectedServerId = this.servers[0].serverId;
          }
          this.updateServers(this.servers);
        }
        resolve(true);
      });
      this.schemaRegistryService.getSchemasConfiguration$().subscribe(schemasConfiguration => {
        const schemaConf: { [id: string]: boolean } = {};
        for (const schemaConfig of schemasConfiguration) {
          schemaConf[schemaConfig.serverId] = schemaConfig.hasSchemaRegistry;
        }
        this.schemaStateService.setSchemaConfiguration(schemaConf);
      });
    });
  }
}
