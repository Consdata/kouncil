import {Injectable} from '@angular/core';
import {ExampleSchemaData} from './schemas.model';
import {SchemaRegistryService} from './schema-registry.service';
import {ProtobufUtilsService} from './protobuf/protobuf-utils.service';

@Injectable({
  providedIn: 'root'
})
export class SchemaFacadeService {

  constructor(private schemaRegistryService: SchemaRegistryService,
              private protobufUtilsService: ProtobufUtilsService) {
  }

  getExampleSchemaData(serverId: string, topic: string): ExampleSchemaData {
    // this.schemaRegistryService.getLatestSchemas(serverId, topic);
    // Fetch Schemas
    // Determine if Protobuf
    // Use proper service to return example data (ProtobufUtilsService)
    //
    return {
      exampleKey: "siaba",
      exampleValue: "daba"
    } as ExampleSchemaData;
  }

}

