import {Injectable} from '@angular/core';
import {ExampleSchemaData} from './schemas.model';
import {SchemaRegistryService} from './schema-registry.service';
import {Observable} from 'rxjs';
import {MessageFormat} from './message-format';
import {map} from 'rxjs/operators';
import {ProtobufUtilsService} from '../protobuf/protobuf-utils.service';
import {JSONSchemaFaker} from "json-schema-faker";

@Injectable({
  providedIn: 'root'
})
export class SchemaFacadeService {

  constructor(private schemaRegistryService: SchemaRegistryService,
              private protobufUtilsService: ProtobufUtilsService) {
  }

  getExampleSchemaData$(serverId: string, topic: string): Observable<ExampleSchemaData> {
    return this.schemaRegistryService.getLatestSchemas$(serverId, topic).pipe(
      map((schemas) => ({
        exampleKey: this.getExample(schemas.keyMessageFormat, schemas.keyPlainTextSchema, true),
        exampleValue: this.getExample(schemas.valueMessageFormat, schemas.valuePlainTextSchema, false)
      } as ExampleSchemaData))
    );
  }

  private getExample(messageFormat: MessageFormat, plainTextSchema: string, isKey: boolean): string {
    let example;
    switch (messageFormat) {
      case MessageFormat.PROTOBUF:
        example = this.protobufUtilsService.fillProtobufSchemaWithData(plainTextSchema);
        console.log(`Found schema, isKey=[${isKey}]`);
        break;
      case MessageFormat.JSON:
        example = JSONSchemaFaker.generate(JSON.parse(plainTextSchema));
        console.log(`Found schema, isKey=[${isKey}]`);
        break;
      case MessageFormat.AVRO:
        example = JSONSchemaFaker.generate(JSON.parse(plainTextSchema));
        console.log(`Found schema, isKey=[${isKey}]`);
        break;
      default:
        console.log(`No schema, isKey=[${isKey}]`);
        break;
    }
    return example;
  }
}

