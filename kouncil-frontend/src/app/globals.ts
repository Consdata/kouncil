import {Injectable} from '@angular/core';
import {Server} from './navbar/navbar.component';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class Globals {
  servers: Server[] = [];
  selectedServer: Server;

  constructor(private http: HttpClient) {
  }

  load() {
    return new Promise((resolve, reject) => {
      this.http.get(`/api/connection`).subscribe(
        value => {
          if (value != null) {
            for (const key in value) {
              const server = new Server();
              server.label = value[key];
              server.serverId = key;
              this.servers.push(server);
            }
            this.selectedServer = this.servers[0];
          }
          resolve(true);
        }
      );
    });
  }

  getSelectedServerId() {
    return this.selectedServer.serverId;
  }

}
