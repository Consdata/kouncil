import {Injectable} from '@angular/core';
import {ExampleSchemaData} from './schemas.model';
import {SchemaRegistryService} from './schema-registry.service';
import {ProtobufUtilsService} from './protobuf/protobuf-utils.service';
import {Observable, of, switchMap} from 'rxjs';
import {MessageFormat} from './message-format';

@Injectable({
  providedIn: 'root'
})
export class SchemaFacadeService {

  constructor(private schemaRegistryService: SchemaRegistryService,
              private protobufUtilsService: ProtobufUtilsService) {
  }

  getExampleSchemaData(serverId: string, topic: string): Observable<ExampleSchemaData> {
    return this.schemaRegistryService.getLatestSchemas$(serverId, topic).pipe(
      switchMap((schemas) => {
        let exampleKey = '';
        let exampleValue;
        switch (schemas.valueMessageFormat as MessageFormat) {
          case MessageFormat.PROTOBUF:
            exampleValue = this.protobufUtilsService.fillProtobufSchemaWithData(schemas.valuePlainTextSchema);
            break;
          case MessageFormat.JSON_SCHEMA:
            console.log('JSON_SCHEMA IS NOT IMPLEMENTED');
            break;
          case MessageFormat.AVRO:
            console.log('AVRO IS NOT IMPLEMENTED');
            break;
          case MessageFormat.STRING:
            exampleValue = '';
            break;
        }
        console.log(`exampleValue=${exampleValue}`);
        return of({exampleKey, exampleValue} as ExampleSchemaData);
      })
    );
  }

}

