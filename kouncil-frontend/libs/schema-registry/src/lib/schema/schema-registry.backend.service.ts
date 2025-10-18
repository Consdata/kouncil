import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Schemas, SchemasConfiguration} from './schemas.model';
import {Observable, of} from 'rxjs';
import {Schema} from './schema.model';
import {SchemaRegistryService} from './schema-registry.service';

@Injectable()
export class SchemaRegistryBackendService implements SchemaRegistryService {
  constructor(private httpClient: HttpClient) {
  }

  getSchemasConfiguration$(): Observable<SchemasConfiguration[]> {
    return this.httpClient.get<SchemasConfiguration[]>(`/api/schemas/configs`);
  }

  getLatestSchemas$(serverId: string, topicName: string): Observable<Schemas> {
    const params = new HttpParams().set('serverId', serverId);
    return this.httpClient.get<Schemas>(`/api/schemas/latest/${topicName}`, {params});
  }

  loadAllSchemasForServer$(selectedServerId: string, topics: string[]): Observable<Schema[]> {
    if (selectedServerId) {
      const params = new HttpParams().set('topicNames', topics.join(','));
      return this.httpClient.get<Schema[]>(`/api/schemas/${selectedServerId}`, {params});
    }
    return of([]);
  }

  deleteSchema$(selectedServerId: string, subject: string, version: string): Observable<void> {
    return this.httpClient.delete<void>(`/api/schemas/${selectedServerId}/${subject}/${version}`);
  }

  getSchemaVersion$(selectedServerId: string, subjectName: string, version: number): Observable<Schema> {
    return this.httpClient.get<Schema>(`/api/schemas/${selectedServerId}/${subjectName}/${version}`);
  }

  addNewSchemaVersion$(model: Schema, selectedServerId: string): Observable<void> {
    return this.httpClient.put<void>(`/api/schemas/${selectedServerId}`, model);
  }

  addNewSchema$(model: Schema, selectedServerId: string): Observable<void> {
    return this.httpClient.post<void>(`/api/schemas/${selectedServerId}`, model);
  }

  testCompatibility$(model: Schema, selectedServerId: string): Observable<boolean> {
    return this.httpClient.post<boolean>(`/api/schemas/test-compatibility/${selectedServerId}`, model);
  }
}

