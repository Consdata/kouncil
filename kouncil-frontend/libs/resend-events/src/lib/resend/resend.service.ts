import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ResendDataModel} from './resend.data.model';

@Injectable()
export abstract class ResendService {
  abstract resend$(serverId: string, message: ResendDataModel): Observable<Record<string, unknown>>;
}

