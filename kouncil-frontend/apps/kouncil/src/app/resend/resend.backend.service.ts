import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ResendDataModel} from './resend.data.model';

@Injectable({
  providedIn: 'root',
})
export class ResendBackendService {
  constructor(private http: HttpClient) {}

  resend$(serverId: string, resendDataModel: ResendDataModel): Observable<Record<string, unknown>> {
    const params = new HttpParams().set('serverId', serverId);
    console.log("I am in resend method of backend")
    return this.http.post<Record<string, unknown>>(
      `/api/topic/resend/${resendDataModel.sourceTopicName}`,
      resendDataModel,
      { params }
    );
  }
}
