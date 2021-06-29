import {Injectable} from '@angular/core';
import {Server} from './server';
import {ServersService} from './servers.service';

@Injectable()
export class ServersDemoService extends ServersService {

  constructor() {
    super();
  }

  load() {
    this.servers = [
      new Server('1', 'first.server.local:9092'),
      new Server('2', 'second.server.local:9092')
    ];
    this.selectedServerId = '1';
  }
}
