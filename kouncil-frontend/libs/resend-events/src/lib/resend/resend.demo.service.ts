import {Injectable} from '@angular/core';
import {ResendService} from './resend.service';
import {from, Observable} from 'rxjs';
import {ResendDataModel} from './resend.data.model';

@Injectable()
export class ResendDemoService implements ResendService {
  resend$(_serverId: string, _resendData: ResendDataModel): Observable<Record<string, unknown>> {
    return from([{}]);
  }
}
