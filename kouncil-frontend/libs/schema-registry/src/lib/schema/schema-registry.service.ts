import {Injectable} from '@angular/core';
import {Schemas, SchemasConfiguration} from './schemas.model';
import {Observable} from 'rxjs';
import {Schema} from './schema.model';

@Injectable()
export abstract class SchemaRegistryService {
  abstract getSchemasConfiguration$(): Observable<SchemasConfiguration[]>;

  abstract getLatestSchemas$(serverId: string, topicName: string): Observable<Schemas>;

  abstract loadAllSchemasForServer$(selectedServerId: string, topics: string[]): Observable<Schema[]>;

  abstract deleteSchema$(selectedServerId: string, subject: string, version: string): Observable<void>;

  abstract getSchemaVersion$(selectedServerId: string, subjectName: string, version: number): Observable<Schema>;

  abstract addNewSchemaVersion$(model: Schema, selectedServerId: string): Observable<void>;

  abstract addNewSchema$(model: Schema, selectedServerId: string): Observable<void>;

  abstract testCompatibility$(model: Schema, selectedServerId: string): Observable<boolean>;
}

