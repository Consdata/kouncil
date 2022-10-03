import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from 'apps/kouncil/src/environments/environment';
import {ResendBackendService} from './resend.backend.service';
import {ResendDemoService} from './resend.demo.service';
import {ResendDataModel} from './resend.data.model';
import {Backend} from '@app/common-model';

@Injectable()
export abstract class ResendService {
  abstract resend$(serverId: string, message: ResendDataModel): Observable<Record<string, unknown>>;
}

export function resendServiceFactory(http: HttpClient): ResendService {
  switch (environment.backend) {
    case Backend.SERVER: {
      return new ResendBackendService(http);
    }
    case Backend.DEMO: {
      return new ResendDemoService();
    }
  }
}
