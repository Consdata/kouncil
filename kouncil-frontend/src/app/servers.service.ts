import {Injectable} from '@angular/core';
import {Server} from './server';

@Injectable()
export abstract class ServersService {
  servers: Server[] = [];
  selectedServerId: string;
  protected constructor() {
  }

  abstract load();

  getSelectedServerId() {
    return this.selectedServerId;
  }

  getServers(): Server[] {
    return this.servers;
  }
}
