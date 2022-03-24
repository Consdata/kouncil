import { Injectable } from '@angular/core';
import { Server } from './server';

@Injectable()
export abstract class ServersService {
  servers: Server[] = [];
  selectedServerId: string;

  abstract load();

  getSelectedServerId(): string {
    return this.selectedServerId;
  }

  getServers(): Server[] {
    return this.servers;
  }
}
