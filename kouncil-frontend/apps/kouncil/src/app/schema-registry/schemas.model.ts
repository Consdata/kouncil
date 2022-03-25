import {MessageFormat} from './message-format';

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
