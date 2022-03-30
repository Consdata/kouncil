import {MessageFormat} from './message-format';

export interface Schemas {
  keyMessageFormat: MessageFormat;
  keyPlainTextSchema: string;
  valueMessageFormat: MessageFormat;
  valuePlainTextSchema: string;
}

export interface ExampleSchemaData {
  exampleKey: string;
  exampleValue: string;
}

export interface SchemasConfiguration {
  serverId: string;
  hasSchemaRegistry: boolean;
}
