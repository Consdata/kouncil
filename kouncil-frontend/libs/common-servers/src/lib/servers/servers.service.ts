import {Injectable} from '@angular/core';
import {Server} from './server';
import {BehaviorSubject, Observable, Subject} from 'rxjs';

@Injectable()
export abstract class ServersService {
  servers: Server[] = [];
  selectedServerId: string;
  private serversSubject$: BehaviorSubject<Server[]> = new BehaviorSubject<Server[]>([]);
  private selectedServerChangedSubject$: Subject<void> = new Subject<void>();

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

  get selectedServerChanged$(): Observable<void> {
    return this.selectedServerChangedSubject$.asObservable();
  }

  selectedServerChanged(): void {
    this.selectedServerChangedSubject$.next();
  }

}
