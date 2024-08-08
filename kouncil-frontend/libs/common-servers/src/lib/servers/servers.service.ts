import {Injectable} from '@angular/core';
import {Server} from './server';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable()
export abstract class ServersService {
  servers: Server[] = [];
  selectedServerId: string;
  private serversSubject$: BehaviorSubject<Server[]> = new BehaviorSubject<Server[]>([]);

  getSelectedServerId(): string {
    return this.selectedServerId;
  }

  abstract load(): Promise<boolean>;

  get servers$(): Observable<Server[]> {
    return this.serversSubject$.asObservable();
  }

  updateServers(servers: Server[]): void {
    this.serversSubject$.next(servers);
  }
}
