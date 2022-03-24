import {Injectable} from '@angular/core';
import {Server} from './server';
import {ServersService} from './servers.service';

@Injectable()
export class ServersDemoService extends ServersService {

  constructor() {
    super();
  }

  load(): void {
    this.servers = [
      new Server('first_server_local_9092', 'first.server.local:9092'),
      new Server('second_server_local_9092', 'second.server.local:9092')
    ];
    this.selectedServerId = 'first_server_local_9092';
  }
}
