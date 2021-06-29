import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../environments/environment';
import {Backend} from './app.backend';
import {ServersBackendService} from './servers.backend.service';
import {ServersDemoService} from './servers.demo.service';
import {Server} from './server';

@Injectable({
  providedIn: 'root'
})
export class ServersService {
  selectedServerId: string;
  constructor() {
  }

  load() {
  }

  getSelectedServerId() {
    return this.selectedServerId;
  }

  getServers(): Server[] {
    return null;
  }
}

export function serverServiceFactory(http: HttpClient): ServersService {
  switch (environment.backend) {
    case Backend.SERVER: {
      return new ServersBackendService(http);
    }
    case Backend.DEMO: {
      return new ServersDemoService();
    }
  }
}
