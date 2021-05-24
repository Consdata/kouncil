import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class Servers {
  servers: Server[] = [];
  selectedServerId: string;

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
            this.selectedServerId = this.servers[0].serverId;
          }
          resolve(true);
        }
      );
    });
  }

  getSelectedServerId() {
    return this.selectedServerId;
  }

}

export class Server {
  serverId: string;
  label: string;
}


