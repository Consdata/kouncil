import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Schemas, SchemasConfiguration} from './schemas.model';
import {Observable} from 'rxjs';
import {Schema} from "./schema.model";

@Injectable({
  providedIn: 'root'
})
export class SchemaRegistryService {
  constructor(private httpClient: HttpClient) {
  }

  getSchemasConfiguration$(): Observable<SchemasConfiguration[]> {
    return this.httpClient.get<SchemasConfiguration[]>(`/api/schemas/configs`);
  }

  getLatestSchemas$(serverId: string, topicName: string): Observable<Schemas> {
    const params = new HttpParams().set('serverId', serverId);
    return this.httpClient.get<Schemas>(`/api/schemas/latest/${topicName}`, {params});
  }

  loadAllSchemasForServer$(selectedServerId: string, topics: string[]) {
    const params = new HttpParams()
    .set('topicNames', topics.join(','))

    return this.httpClient.get<Schema[]>(`/api/schemas/${selectedServerId}`, {params});
  }

  deleteSchema(selectedServerId: string, subject: string, version: string) {
    return this.httpClient.delete<void>(`/api/schemas/${selectedServerId}/${subject}/${version}`);
  }

  getLatestSchema$(selectedServerId: string, subjectName: any) {
    return this.httpClient.get<Schema>(`/api/schemas/${selectedServerId}/${subjectName}`);
  }

  addNewSchemaVersion$(model: Schema, selectedServerId: string) {
    return this.httpClient.put<void>(`/api/schemas/${selectedServerId}`, model);

  }
}

