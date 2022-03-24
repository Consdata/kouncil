import { Injectable } from '@angular/core';
import { Server } from './server';

@Injectable()
export abstract class ServersService {
  servers: Server[] = [];
  selectedServerId: string;

  getSelectedServerId(): string {
    return this.selectedServerId;
  }

  abstract load(): Promise<boolean>;

  getServers(): Server[] {
    return this.servers;
  }
}
