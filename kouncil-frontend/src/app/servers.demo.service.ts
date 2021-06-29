import {Injectable} from '@angular/core';
import {Server} from './server';
import {ServersService} from './servers.service';

@Injectable({
  providedIn: 'root'
})
export class ServersDemoService implements ServersService {
  servers: Server[] = [
    new Server('1', 'first.server.local:9092'),
    new Server('2', 'second.server.local:9092')
  ];
  selectedServerId = '1';

  constructor() {
  }

  load() {
  }

  getSelectedServerId() {
    return this.selectedServerId;
  }

  getServers(): Server[] {
    return this.servers;
  }

}
