import {Injectable} from '@angular/core';
import {Schemas, SchemasConfiguration} from './schemas.model';
import {Observable, of} from 'rxjs';
import {Schema} from './schema.model';
import {MessageFormat} from './message-format';
import {SubjectType} from './subject-type';
import {SchemaRegistryService} from './schema-registry.service';

@Injectable()
export class SchemaRegistryDemoService implements SchemaRegistryService {

  allDemoSchemas: Array<Schema> = [
    {
      subjectName: 'user-reports-key',
      messageFormat: MessageFormat.JSON,
      plainTextSchema: `{
          "type": "object",
          "properties": {
            "firstName": {
              "type": "string",
              "description": "The person's first name."
            },
            "lastName": {
              "type": "string",
              "description": "The person's last name."
            },
            "age": {
              "description": "Age in years which must be equal to or greater than zero.",
              "type": "integer",
              "minimum": 0
            }
          }
        }`,
      topicName: 'user-reports',
      version: 1,
      subjectType: SubjectType.KEY,
      versionsNo: [1]
    } as Schema
  ];

  getSchemasConfiguration$(): Observable<SchemasConfiguration[]> {
    return of([]);
  }

  getLatestSchemas$(_serverId: string, _topicName: string): Observable<Schemas> {
    return of({} as Schemas);
  }

  loadAllSchemasForServer$(_selectedServerId: string, _topics: string[]): Observable<Schema[]> {
    return of(this.allDemoSchemas);
  }

  deleteSchema$(_selectedServerId: string, _subject: string, _version: string): Observable<void> {
    return of(undefined);
  }

  getSchemaVersion$(_selectedServerId: string, subjectName: string, version: number): Observable<Schema> {
    return of(this.allDemoSchemas.find(schema => schema.version === Number(version)));
  }

  addNewSchemaVersion$(_model: Schema, _selectedServerId: string): Observable<void> {
    return of(undefined);
  }

  addNewSchema$(_model: Schema, _selectedServerId: string): Observable<void> {
    return of(undefined);
  }

  testCompatibility$(_model: Schema, _selectedServerId: string): Observable<boolean> {
    return of(true);
  }
}

