import {Injectable} from '@angular/core';
import {ExampleSchemaData} from './schemas.model';
import {Observable} from 'rxjs';
import {MessageFormat} from './message-format';
import {map} from 'rxjs/operators';
import {ProtobufUtilsService} from '../protobuf/protobuf-utils.service';
import {JSONSchemaFaker} from 'json-schema-faker';
import {SchemaRegistryService} from './schema-registry.service';
import {AvroUtilsService} from '../avro/avro-utils.service';
import {LoggerFactory} from '@consdata/logger-api';

const log = LoggerFactory.getLogger('SchemaFacadeService');

@Injectable({
  providedIn: 'root'
})
export class SchemaFacadeService {

  constructor(private schemaRegistryService: SchemaRegistryService,
              private protobufUtilsService: ProtobufUtilsService,
              private avroUtilsService: AvroUtilsService) {
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
        log.info(`Found schema, isKey=[${isKey}]`);
        break;
      case MessageFormat.JSON:
        example = JSONSchemaFaker.generate(JSON.parse(plainTextSchema));
        log.info(`Found schema, isKey=[${isKey}]`);
        break;
      case MessageFormat.AVRO:
        example = this.avroUtilsService.fillAvroSchemaWithData(plainTextSchema);
        log.info(`Found schema, isKey=[${isKey}]`);
        break;
      default:
        log.info(`No schema, isKey=[${isKey}]`);
        break;
    }
    return example;
  }
}

