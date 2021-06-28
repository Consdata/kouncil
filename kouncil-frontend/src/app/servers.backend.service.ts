import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Server} from './server';
import {ServersService} from './servers.service';

@Injectable({
  providedIn: 'root'
})
export class ServersBackendService implements ServersService {
  servers: Server[] = [];
  selectedServerId: string;

  constructor(private http: HttpClient) {
  }

  load() {
    return new Promise((resolve) => {
      this.http.get(`/api/connection`).subscribe(
        value => {
          if (value != null) {
            const lastSelectedServer = localStorage.getItem('lastSelectedServer');
            for (const key in value) {
              if (value.hasOwnProperty(key)) {
                this.servers.push(new Server(key, value[key]));
                if (key === lastSelectedServer) {
                  this.selectedServerId = key;
                }
              }
            }

            if (this.selectedServerId === undefined) {
              this.selectedServerId = this.servers[0].serverId;
            }
          }
          resolve(true);
        }
      );
    });
  }

  getSelectedServerId() {
    return this.selectedServerId;
  }

  getServers(): Server[] {
    return this.servers;
  }

}
