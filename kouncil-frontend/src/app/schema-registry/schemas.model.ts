export class Schemas {
  keyMessageFormat: MessageFormat
  keyPlainTextSchema: string;
  valueMessageFormat: MessageFormat
  valuePlainTextSchema: string;
}

export class ExampleSchemaData {
  exampleKey: string;
  exampleValue: string;
}

export enum MessageFormat {
  JSON_SCHEMA = 'JSON_SCHEMA',
  PROTOBUF = 'PROTOBUF',
  AVRO = 'AVRO',
  STRING = 'STRING'
}
