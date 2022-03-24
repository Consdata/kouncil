import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Schemas} from './schemas.model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SchemaRegistryService {
  constructor(private httpClient: HttpClient) {
  }

  getLatestSchemas(serverId: string, topicName: string): Observable<Schemas> {
    const params = new HttpParams().set('serverId', serverId);
    return this.httpClient.get<Schemas>(`/api/schemas/latest/${topicName}`, {params});
  }
}

