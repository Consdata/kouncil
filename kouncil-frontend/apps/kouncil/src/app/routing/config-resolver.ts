import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {ServersService} from "@app/common-servers";
import {configProviderFactory} from "../app.module";

@Injectable({ providedIn: 'root' })
export class ConfigResolver implements Resolve<boolean> {
  constructor(private service: ServersService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean>|Promise<boolean>| boolean {
    console.log('resolve');
    return configProviderFactory(this.service);
  }
}
