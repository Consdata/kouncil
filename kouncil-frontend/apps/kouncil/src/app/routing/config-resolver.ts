import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServersService } from '@app/common-servers';
import { configProviderFactory } from '../app.module';

@Injectable({providedIn: 'root'})
export class ConfigResolver {

  constructor(private service: ServersService) {
  }

  resolve(): Observable<boolean> | Promise<boolean> | boolean {
    return configProviderFactory(this.service);
  }
}
