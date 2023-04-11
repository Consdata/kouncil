import {MessageDataHeader} from './message-data-header';
import {MessageFormat} from '@app/schema-registry';

export interface MessageData {
  key: string;
  keyFormat: MessageFormat;
  value: string;
  valueFormat: MessageFormat;
  offset: number | null;
  partition: number | null;
  timestamp?: number | null;
  headers?: MessageDataHeader[];
  topicName: string;
  topic: string;
}
